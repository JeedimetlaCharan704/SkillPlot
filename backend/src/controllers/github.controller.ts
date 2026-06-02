import { Response, NextFunction } from 'express'
import * as githubService from '../services/github.service'
import { AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

export async function analyze(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const username = String(req.params.username)

    if (!username || username.length < 2) {
      throw new AppError('Username must be at least 2 characters', 400)
    }

    const analysis = await githubService.getFullAnalysis(username)

    res.json({ data: analysis })
  } catch (err: any) {
    if (err.statusCode === 429) {
      res.status(429).json({
        error: 'GitHub API rate limited. Try again later or configure GITHUB_TOKEN.',
      })
      return
    }
    next(err)
  }
}

export async function getUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const username = String(req.params.username)
    const user = await githubService.getUser(username)
    res.json({ data: { user } })
  } catch (err) {
    next(err)
  }
}

export async function getRepos(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const username = String(req.params.username)
    const page = parseInt(req.query.page as string, 10) || 1
    const repos = await githubService.getRepos(username, page)
    res.json({ data: { repos, page } })
  } catch (err) {
    next(err)
  }
}
