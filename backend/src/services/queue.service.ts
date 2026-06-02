import env from '../config/env'
import logger from './logger.service'

let Queue: any = null
let resumeQueue: any = null
let githubQueue: any = null

async function initQueue(): Promise<{ resumeQueue: any; githubQueue: any } | null> {
  try {
    const Bull = require('bull')
    const redisUrl = env.redisUrl || 'redis://127.0.0.1:6379'

    resumeQueue = new Bull('resume-analysis', redisUrl, {
      defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 100, removeOnFail: 50 },
    })

    githubQueue = new Bull('github-analysis', redisUrl, {
      defaultJobOptions: { attempts: 2, backoff: { type: 'fixed', delay: 5000 }, removeOnComplete: 100, removeOnFail: 50 },
    })

    resumeQueue.on('completed', (job: any) => logger.info(`Resume analysis job ${job.id} completed`, { jobId: job.id }))
    resumeQueue.on('failed', (job: any, err: any) => logger.error(`Resume analysis job ${job.id} failed`, { jobId: job.id, error: err.message }))
    githubQueue.on('completed', (job: any) => logger.info(`GitHub analysis job ${job.id} completed`, { jobId: job.id }))
    githubQueue.on('failed', (job: any, err: any) => logger.error(`GitHub analysis job ${job.id} failed`, { jobId: job.id, error: err.message }))

    return { resumeQueue, githubQueue }
  } catch (err: any) {
    logger.warn('Queue system unavailable (Redis not running) — jobs will run synchronously', { error: err.message })
    return null
  }
}

function getResumeQueue(): any { return resumeQueue }
function getGithubQueue(): any { return githubQueue }

export { initQueue, getResumeQueue, getGithubQueue }
