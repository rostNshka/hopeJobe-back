const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const authRoutes = require('./routes/authRoutes.js')
const vacancyRoutes = require('./routes/vacancyRoutes.js')
const responseRoutes = require('./routes/responseRoutes.js')
const userRoutes = require('./routes/userRoutes.js')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4200

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/vacancies', vacancyRoutes)
app.use('/api/responses', responseRoutes)
app.use('/api/users', userRoutes)

app.use((err, req, res) => {
  console.error('Ошибка:', err?.stack || err)
  res?.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err?.message : undefined
  })
})

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту: ${PORT}`)
  console.log(`📍 http://localhost:${PORT}`)
})