const mongoose = require('mongoose')
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const User = require('./models/User')
const Profile = require('./models/Profile')
const env = require('./config/env')

const DEMO_USERS = [
  { name: 'Aryan Sharma', email: 'student@skillpilot.ai', password: 'demo123', role: 'student' },
  { name: 'Dr. Priya Patel', email: 'mentor@skillpilot.ai', password: 'demo123', role: 'mentor' },
  { name: 'Rahul Verma', email: 'recruiter@skillpilot.ai', password: 'demo123', role: 'recruiter' },
  { name: 'Admin User', email: 'admin@skillpilot.ai', password: 'admin123', role: 'admin' },
]

async function seed () {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 })
    console.log('[Seed] Connected to MongoDB')

    for (const u of DEMO_USERS) {
      const existing = await User.findOne({ email: u.email })
      if (existing) {
        console.log(`[Seed] Skipping ${u.email} — already exists`)
        continue
      }
      const user = await User.create(u)
      // Create empty profile for each user
      await Profile.create({ user: user._id })
      console.log(`[Seed] Created ${u.role}: ${u.email}`)
    }

    console.log('[Seed] Done!')
    process.exit(0)
  } catch (err) {
    console.error('[Seed] Error:', err.message)
    process.exit(1)
  }
}

seed()
