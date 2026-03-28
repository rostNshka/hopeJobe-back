import express from 'express'
import { vacancyRouter } from './src/vacancy/vacancy.controller.js'
import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const app = express()

async function main() {
  app.use(express.json())

  app.use('/api', vacancyRouter)

  app.all(/.*/, (req, res) => {
    res.status(404).json({ message: 'Not Found' })
  })

  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({
      message: err.message,
    })
  })

  const PORT = process.env.PORT || 4200
  app.listen(PORT, () => {
    console.log(`✅ Server started on port ${PORT}`)
    console.log(`📍 API URL: http://localhost:${PORT}/api`)
  })
}

main().catch(err => {
  console.error('Failed to start server:', err)
})