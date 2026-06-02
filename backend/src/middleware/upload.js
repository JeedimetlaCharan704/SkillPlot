const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const uploadDir = path.resolve(__dirname, '../../uploads')

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const fs = require('fs')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}${ext}`)
  },
})

const fileFilter = (_req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx', '.txt', '.rtf']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Allowed: ${allowed.join(', ')}`), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

module.exports = upload
