const env = require('../config/env')
const cache = require('./cache.service')
const { AppError } = require('../middleware/errorHandler')

const GITHUB_API = 'https://api.github.com'
const CACHE_TTL = 10 * 60 * 1000

async function fetchFromGitHub (path) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'SkillPilot-AI/1.0',
  }

  if (env.githubToken) {
    headers.Authorization = `Bearer ${env.githubToken}`
  }

  const response = await fetch(`${GITHUB_API}${path}`, { headers })

  if (response.status === 403) {
    throw new AppError('GitHub API rate limit exceeded. Add GITHUB_TOKEN to .env for higher limits.', 429)
  }

  if (response.status === 404) {
    throw new AppError('GitHub user or repository not found', 404)
  }

  if (!response.ok) {
    throw new AppError(`GitHub API error: ${response.status}`, response.status)
  }

  return response.json()
}

async function getUser (username) {
  const cacheKey = `github:user:${username}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const data = await fetchFromGitHub(`/users/${encodeURIComponent(username)}`)
  cache.set(cacheKey, data, CACHE_TTL)
  return data
}

async function getRepos (username, page = 1, perPage = 30) {
  const cacheKey = `github:repos:${username}:${page}:${perPage}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const data = await fetchFromGitHub(`/users/${encodeURIComponent(username)}/repos?page=${page}&per_page=${perPage}&sort=updated&direction=desc`)
  cache.set(cacheKey, data, CACHE_TTL)
  return data
}

async function getRepoLanguages (username, repo) {
  const cacheKey = `github:languages:${username}:${repo}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const data = await fetchFromGitHub(`/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/languages`)
  cache.set(cacheKey, data, CACHE_TTL)
  return data
}

async function getReadme (username, repo) {
  const cacheKey = `github:readme:${username}:${repo}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  try {
    const data = await fetchFromGitHub(`/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/readme`)
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    cache.set(cacheKey, content, CACHE_TTL)
    return content
  } catch {
    return null
  }
}

async function getEvents (username, page = 1) {
  const cacheKey = `github:events:${username}:${page}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const data = await fetchFromGitHub(`/users/${encodeURIComponent(username)}/events?page=${page}&per_page=30`)
  cache.set(cacheKey, data, CACHE_TTL)
  return data
}

function computeRepoQuality (repo, languages, hasReadme) {
  const readmeScore = hasReadme ? 20 : 0
  const descScore = (repo.description && repo.description.length > 10) ? 20 : repo.description ? 10 : 0
  const topicsScore = (repo.topics && repo.topics.length > 0) ? Math.min(15, repo.topics.length * 3) : 0
  const starsScore = Math.min(20, repo.stargazers_count)
  const sizeScore = repo.size > 0 ? Math.min(15, Math.round(Math.log2(repo.size + 1) * 2)) : 0
  const techScore = languages && Object.keys(languages).length > 0 ? Math.min(10, Object.keys(languages).length * 2) : 0

  return Math.min(100, readmeScore + descScore + topicsScore + starsScore + sizeScore + techScore)
}

function computeMaturity (user, repos, recentActivity) {
  const consistency = Math.min(25, repos.length > 10 ? 25 : repos.length * 2.5)
  const diversity = repos.length > 0 ? Math.min(20, new Set(repos.map(r => r.language).filter(Boolean)).size * 3) : 0
  const documentation = repos.length > 0
    ? Math.round(repos.filter(r => r.description && r.topics && r.topics.length > 0).length / repos.length * 20)
    : 0
  const openSource = Math.min(15, repos.filter(r => r.fork).length * 2)
  const techBreadth = repos.length > 0
    ? Math.min(20, new Set(repos.flatMap(r => r.topics || [])).size * 2)
    : 0

  return Math.min(100, consistency + diversity + documentation + openSource + techBreadth)
}

async function getFullAnalysis (username) {
  const [user, repos] = await Promise.all([
    getUser(username),
    getRepos(username),
  ])

  const repoAnalyses = await Promise.all(repos.slice(0, 20).map(async (repo) => {
    const [languages, readme] = await Promise.all([
      getRepoLanguages(username, repo.name).catch(() => null),
      getReadme(username, repo.name).catch(() => null),
    ])
    return {
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      topics: repo.topics || [],
      size: repo.size,
      updatedAt: repo.updated_at,
      qualityScore: computeRepoQuality(repo, languages, !!readme),
      languages: languages ? Object.keys(languages) : [],
      hasReadme: !!readme,
      isFork: repo.fork,
    }
  }))

  const events = await getEvents(username).catch(() => [])
  const recentActivity = events.filter(e => {
    const d = new Date(e.created_at)
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    return d.getTime() > cutoff
  }).length

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0)
  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))]
  const topRepos = repoAnalyses.sort((a, b) => b.qualityScore - a.qualityScore)

  return {
    user: {
      login: user.login,
      name: user.name,
      avatar: user.avatar_url,
      bio: user.bio,
      location: user.location,
      company: user.company,
      blog: user.blog,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      createdAt: user.created_at,
    },
    stats: {
      totalRepos: repos.length,
      totalStars,
      totalForks: repos.reduce((s, r) => s + r.forks_count, 0),
      languages,
      topLanguage: languages[0] || 'Unknown',
      recentActivity,
      averageQuality: Math.round(repoAnalyses.reduce((s, r) => s + r.qualityScore, 0) / Math.max(1, repoAnalyses.length)),
    },
    repos: topRepos.slice(0, 10),
    maturityScore: computeMaturity(user, repos, recentActivity),
  }
}

module.exports = { getUser, getRepos, getRepoLanguages, getReadme, getEvents, getFullAnalysis }
