import { getResumeQueue, getGithubQueue } from '../services/queue.service'
import { processResumeJob } from './resume.processor'
import logger from '../services/logger.service'

function registerJobProcessors(): void {
  const resumeQueue = getResumeQueue()
  const githubQueue = getGithubQueue()

  if (resumeQueue) {
    resumeQueue.process(processResumeJob)
    logger.info('Resume analysis job processor registered')
  }

  if (githubQueue) {
    githubQueue.process(async (job: any) => {
      logger.info(`Processing GitHub analysis job`, { jobId: job.id, username: job.data.username })
      const githubService = require('../services/github.service')
      const result = await githubService.analyze(job.data.username)
      return result
    })
    logger.info('GitHub analysis job processor registered')
  }
}

export { registerJobProcessors }
