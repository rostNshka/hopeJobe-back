const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../../prisma-backup.js')
const asyncHandler = require('../middleware/asyncHandler')

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  const { email, password, role, firstName, lastName, patronymic, companyName, description } = req.body
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

  const token = jwt.sign(
    { userId: result.id, email: result.email, role: result.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )

  res.status(201).json({
    message: 'Пользователь создан',
    token,
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

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )

  res.json({
    message: 'Вход в систему прошел успешно',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile,
    },
  })
}

module.exports = {
  register: asyncHandler(register),
  login: asyncHandler(login),
}