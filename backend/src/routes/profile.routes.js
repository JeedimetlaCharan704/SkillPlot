const { Router } = require('express')
const ctrl = require('../controllers/profile.controller')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.use(authenticate)

router.get('/', ctrl.getProfile)
router.put('/', ctrl.updateProfile)

router.post('/projects', ctrl.addProject)
router.put('/projects/:projectId', ctrl.updateProject)
router.delete('/projects/:projectId', ctrl.deleteProject)

router.post('/certifications', ctrl.addCertification)
router.delete('/certifications/:certId', ctrl.deleteCertification)

router.post('/internships', ctrl.addInternship)
router.delete('/internships/:internshipId', ctrl.deleteInternship)

module.exports = router
