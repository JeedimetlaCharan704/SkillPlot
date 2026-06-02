import { Router } from 'express'
import * as ctrl from '../controllers/analytics.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/dashboard', ctrl.getDashboard)
router.get('/placement', ctrl.getPlacement)
router.get('/skill-gap', ctrl.getSkillGap)

export default router
