const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../../prisma-backup.js')
const asyncHandler = require('../middleware/asyncHandler')

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  )

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  )

  return { accessToken, refreshToken }
}

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  const { email, password, role, firstName, lastName, patronymic, companyName, description } = req.body
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return res.status(400).json({
      message: 'Пользователь с таким email уже существует',
      code: 'USER_EXISTS'
    })
  }
  const hashedPassword = await bcrypt.hash(password, 10)

  const result = await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role === 'EMPLOYER' ? 'EMPLOYER' : 'USER',
      },
    })

    if (role === 'EMPLOYER') {
      await prisma.employer.create({
        data: {
          companyName,
          email: email,
          description: description || null,
          userId: user.id,
        },
      })
    } else {
      await prisma.candidate.create({
        data: {
          firstName,
          lastName,
          patronymic: patronymic || null,
          email: email,
          userId: user.id,
        },
      })
    }

    return user
  })

  const { accessToken, refreshToken } = generateTokens(result)

  await prisma.user.update({
    where: { id: result.id },
    data: { refreshToken }
  })

  res.status(201).json({
    message: 'Пользователь создан',
    accessToken,
    refreshToken,
    user: {
      id: result.id,
      email: result.email,
      role: result.role,
    },
  })
}

/**
 * Login user
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return res.status(401).json({
      message: 'Неверные данные',
    })
  }

  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    return res.status(401).json({
      message: 'Неверные данные',
    })
  }

  let profile
  if (user.role === 'EMPLOYER') {
    profile = await prisma.employer.findUnique({
      where: { userId: user.id },
    })
  } else {
    profile = await prisma.candidate.findUnique({
      where: { userId: user.id },
    })
  }

  const { accessToken, refreshToken } = generateTokens(user)

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  })

  res.json({
    message: 'Вход в систему прошел успешно',
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile,
    },
  })
}

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 */
const refresh = async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({
      message: 'Refresh token не предоставлен'
    })
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
    )

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        message: 'Недействительный refresh token'
      })
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user)

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    })

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    })

  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(401).json({
      message: 'Недействительный или истекший refresh token'
    })
  }
}

/**
 * Logout user
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
  const { refreshToken } = req.body

  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
      )

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { refreshToken: null }
      })
    } catch (error) {
    }
  }

  res.json({
    message: 'Выход выполнен успешно'
  })
}

module.exports = {
  register: asyncHandler(register),
  login: asyncHandler(login),
  refresh: asyncHandler(refresh),
  logout: asyncHandler(logout),
}