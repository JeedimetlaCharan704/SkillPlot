const githubService = require('../services/github.service')
const { AppError } = require('../middleware/errorHandler')

exports.analyze = async (req, res, next) => {
  try {
    const { username } = req.params

    if (!username || username.length < 2) {
      throw new AppError('Username must be at least 2 characters', 400)
    }

    const analysis = await githubService.getFullAnalysis(username)

    res.json({ data: analysis })
  } catch (err) {
    if (err.statusCode === 429) {
      return res.status(429).json({
        error: 'GitHub API rate limited. Try again later or configure GITHUB_TOKEN.',
      })
    }
    next(err)
  }
}

exports.getUser = async (req, res, next) => {
  try {
    const { username } = req.params
    const user = await githubService.getUser(username)
    res.json({ data: { user } })
  } catch (err) {
    next(err)
  }
}

exports.getRepos = async (req, res, next) => {
  try {
    const { username } = req.params
    const page = parseInt(req.query.page, 10) || 1
    const repos = await githubService.getRepos(username, page)
    res.json({ data: { repos, page } })
  } catch (err) {
    next(err)
  }
}
