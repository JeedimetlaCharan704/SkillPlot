import { Router } from 'express'
import * as ctrl from '../controllers/github.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/:username', ctrl.analyze)
router.get('/:username/user', ctrl.getUser)
router.get('/:username/repos', ctrl.getRepos)

export default router
