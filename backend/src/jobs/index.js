const { getResumeQueue, getGithubQueue } = require('../services/queue.service')
const { processResumeJob } = require('./resume.processor')
const logger = require('../services/logger.service')

function registerJobProcessors () {
  const resumeQueue = getResumeQueue()
  const githubQueue = getGithubQueue()

  if (resumeQueue) {
    resumeQueue.process(processResumeJob)
    logger.info('Resume analysis job processor registered')
  }

  if (githubQueue) {
    githubQueue.process(async (job) => {
      logger.info(`Processing GitHub analysis job`, { jobId: job.id, username: job.data.username })
      const githubService = require('../services/github.service')
      const result = await githubService.analyze(job.data.username)
      return result
    })
    logger.info('GitHub analysis job processor registered')
  }
}

module.exports = { registerJobProcessors }
