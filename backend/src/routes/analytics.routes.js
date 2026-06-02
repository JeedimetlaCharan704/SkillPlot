const { Router } = require('express')
const ctrl = require('../controllers/analytics.controller')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.use(authenticate)

router.get('/dashboard', ctrl.getDashboard)
router.get('/placement', ctrl.getPlacement)
router.get('/skill-gap', ctrl.getSkillGap)

module.exports = router
