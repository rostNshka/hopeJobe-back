const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { PrismaClient } = require('@prisma/client')
const authRoutes = require('./routes/authRoutes.js')
const vacancyRoutes = require('./routes/vacancyRoutes.js')
const responseRoutes = require('./routes/responseRoutes.js')
const userRoutes = require('./routes/userRoutes.js')

dotenv.config()

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/vacancies', vacancyRoutes)
app.use('/api/responses', responseRoutes)
app.use('/api/users', userRoutes)

app.listen((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

const PORT = process.env.PORT || 4200

app.listen(PORT, () => {
  console.log(`Сервер запущен на порте: ${PORT}`)
})