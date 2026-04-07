const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

/**
 * Get user profile
 * @route GET /api/users/profile
 */
const getProfile = async (req, res) => {
  try {
    let profile

    if (req.user.role === 'EMPLOYER') {
      profile = await prisma.employer.findUnique({
        where: { userId: req.user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      })
    } else {
      profile = await prisma.candidate.findUnique({
        where: { userId: req.user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      })
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Профиль не найден'
      })
    }

    res.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Ошибка получения профиля:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении профиля',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Update user profile
 * @route PUT /api/users/profile
 */
const updateProfile = async (req, res) => {
  try {
    let updatedProfile

    if (req.user.role === 'EMPLOYER') {
      const { companyName, description } = req.body

      const updateData = {}
      if (companyName !== undefined) updateData.companyName = companyName
      if (description !== undefined) updateData.description = description

      updatedProfile = await prisma.employer.update({
        where: { userId: req.user.id },
        data: updateData,
        include: {
          user: {
            select: {
              email: true,
              role: true
            }
          }
        }
      })
    } else {
      const { firstName, lastName, patronymic } = req.body

      const updateData = {}
      if (firstName !== undefined) updateData.firstName = firstName
      if (lastName !== undefined) updateData.lastName = lastName
      if (patronymic !== undefined) updateData.patronymic = patronymic

      updatedProfile = await prisma.candidate.update({
        where: { userId: req.user.id },
        data: updateData,
        include: {
          user: {
            select: {
              email: true,
              role: true
            }
          }
        }
      })
    }

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Профиль успешно обновлен'
    })
  } catch (error) {
    console.error('Ошибка обновления профиля:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении профиля',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

module.exports = { getProfile, updateProfile }