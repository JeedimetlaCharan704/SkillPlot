import { Router } from 'express'
import * as ctrl from '../controllers/resume.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.post('/analyze', ctrl.analyze)
router.get('/history', ctrl.getHistory)
router.get('/history/:id', ctrl.getById)

export default router
