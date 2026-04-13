const prisma = require('../../prisma-backup.js')

/**
 * Добавить вакансию в избранное
 * @route POST /api/responses
 */
const addToFavorites = async (req, res) => {
  try {
    const { vacancyId } = req.body
    const userId = req.user.id

    // Проверка существования вакансии
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId }
    })

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Вакансия не найдена'
      })
    }

    // Проверка, не добавлена ли уже в избранное
    const existingResponse = await prisma.response.findUnique({
      where: {
        userId_vacancyId: {
          userId,
          vacancyId
        }
      }
    })

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: 'Вакансия уже находится в избранном'
      })
    }

    const response = await prisma.response.create({
      data: {
        userId,
        vacancyId
      },
      include: {
        vacancy: {
          include: {
            employer: {
              select: {
                companyName: true,
                email: true
              }
            }
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      data: response
    })
  } catch (error) {
    console.error('Ошибка добавления в избранное:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при добавлении в избранное',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Удалить вакансию из избранного
 * @route DELETE /api/responses/:vacancyId
 */
const removeFromFavorites = async (req, res) => {
  try {
    const { vacancyId } = req.params
    const userId = req.user.id

    // Проверка существования записи
    const response = await prisma.response.findUnique({
      where: {
        userId_vacancyId: {
          userId,
          vacancyId: parseInt(vacancyId)
        }
      }
    })

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Вакансия не найдена в избранном'
      })
    }

    await prisma.response.delete({
      where: {
        userId_vacancyId: {
          userId,
          vacancyId: parseInt(vacancyId)
        }
      }
    })

    res.json({
      success: true,
      message: 'Вакансия успешно удалена из избранного'
    })
  } catch (error) {
    console.error('Ошибка удаления из избранного:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении из избранного',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Получить избранные вакансии пользователя
 * @route GET /api/responses
 */
const getUserFavorites = async (req, res) => {
  try {
    const favorites = await prisma.response.findMany({
      where: { userId: req.user.id },
      include: {
        vacancy: {
          include: {
            employer: {
              select: {
                companyName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: favorites
    })
  } catch (error) {
    console.error('Ошибка получения избранного:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении списка избранных вакансий',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Проверить, находится ли вакансия в избранном у пользователя
 * @route GET /api/responses/check/:vacancyId
 */
const checkFavoriteStatus = async (req, res) => {
  try {
    const { vacancyId } = req.params
    const userId = req.user.id

    const favorite = await prisma.response.findUnique({
      where: {
        userId_vacancyId: {
          userId,
          vacancyId: parseInt(vacancyId)
        }
      }
    })

    res.json({
      success: true,
      data: {
        isFavorite: !!favorite
      }
    })
  } catch (error) {
    console.error('Ошибка проверки статуса избранного:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при проверке статуса избранного',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkFavoriteStatus
}