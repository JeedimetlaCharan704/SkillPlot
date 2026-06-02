const { Router } = require('express')
const ctrl = require('../controllers/github.controller')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.use(authenticate)

router.get('/:username', ctrl.analyze)
router.get('/:username/user', ctrl.getUser)
router.get('/:username/repos', ctrl.getRepos)

module.exports = router
