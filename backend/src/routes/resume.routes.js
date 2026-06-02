const { Router } = require('express')
const ctrl = require('../controllers/resume.controller')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.use(authenticate)

router.post('/analyze', ctrl.analyze)
router.get('/history', ctrl.getHistory)
router.get('/history/:id', ctrl.getById)

module.exports = router
