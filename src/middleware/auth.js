const jwt = require('jsonwebtoken')
const prisma = require('../../prisma-backup.js')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        message: 'Токен не предоставлен',
        code: 'TOKEN_MISSING'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return res.status(401).json({
        message: 'Пользователь не найден',
        code: 'USER_NOT_FOUND'
      })
    }

    req.user = user
    req.userId = user.id
    req.token = token
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Истек срок действия токена',
        expired: true,
        code: 'TOKEN_EXPIRED'
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Недействительный токен',
        code: 'INVALID_TOKEN'
      })
    }

    res.status(401).json({
      message: 'Пожалуйста, пройдите аутентификацию',
      code: 'AUTH_ERROR'
    })
  }
}


const requireEmployer = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Требуется авторизация',
      code: 'UNAUTHORIZED'
    })
  }

  if (req.user.role !== 'EMPLOYER') {
    return res.status(403).json({
      message: 'Доступ запрещен. Требуемая роль - работодатель.',
      code: 'FORBIDDEN'
    })
  }

  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id }
  })

  if (!employer) {
    return res.status(403).json({
      message: 'Профиль работодателя не найден',
      code: 'PROFILE_NOT_FOUND'
    })
  }

  req.employer = employer
  next()
}

module.exports = { auth, requireEmployer }