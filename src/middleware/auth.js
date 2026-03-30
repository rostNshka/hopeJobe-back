const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new Error('Такой токен не найден')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      throw new Error('Пользователь не найден')
    }

    req.user = user;
    req.token = token;
    next()
  } catch (error) {
    res.status(401).json({ message: 'Пожалуйста, пройдите аутентификацию' })
  }
}

const requireEmployer = async (req, res, next) => {
  if (req.user.role !== 'EMPLOYER') {
    return res.status(403).json({ message: 'Доступ запрещен. Требуемая роль - работодатель.' })
  }

  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id }
  })

  if (!employer) {
    return res.status(403).json({ message: 'Профиль не найден' })
  }

  req.employer = employer
  next()
}

module.exports = { auth, requireEmployer }