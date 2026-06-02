import { Router } from 'express'
import * as ctrl from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'
import { validate, authSchemas } from '../middleware/validate'

const router = Router()

router.post('/register', validate(authSchemas.register), ctrl.register)
router.post('/login', validate(authSchemas.login), ctrl.login)
router.get('/me', authenticate, ctrl.getMe)

router.get('/google', ctrl.googleAuth)
router.get('/google/callback', ctrl.googleCallback)

router.post('/forgot-password', ctrl.forgotPassword)
router.post('/reset-password', ctrl.resetPassword)

export default router
