const prisma = require('../../prisma-backup.js')
const asyncHandler = require('../middleware/asyncHandler')

/**
 * Добавить вакансию в избранное
 * @route POST /api/responses
 */
const addToFavorites = async (req, res) => {

  const { vacancyId } = req.body
  const userId = req.user.id

  const vacancy = await prisma.vacancy.findUnique({
    where: { id: vacancyId },
  })

  if (!vacancy) {
    return res.status(404).json({
      success: false,
      message: 'Вакансия не найдена',
    })
  }

  const existingResponse = await prisma.response.findUnique({
    where: {
      userId_vacancyId: {
        userId,
        vacancyId,
      },
    },
  })

  if (existingResponse) {
    return res.status(400).json({
      success: false,
      message: 'Вакансия уже находится в избранном',
    })
  }

  const response = await prisma.response.create({
    data: {
      userId,
      vacancyId,
    },
    include: {
      vacancy: {
        include: {
          employer: {
            select: {
              companyName: true,
              email: true,
            },
          },
        },
      },
    },
  })

  res.status(201).json({
    success: true,
    data: response,
  })
}

/**
 * Удалить вакансию из избранного
 * @route DELETE /api/responses/:vacancyId
 */
const removeFromFavorites = async (req, res) => {

  const { vacancyId } = req.params
  const userId = req.user.id

  const response = await prisma.response.findUnique({
    where: {
      userId_vacancyId: {
        userId,
        vacancyId: parseInt(vacancyId),
      },
    },
  })

  if (!response) {
    return res.status(404).json({
      success: false,
      message: 'Вакансия не найдена в избранном',
    })
  }

  await prisma.response.delete({
    where: {
      userId_vacancyId: {
        userId,
        vacancyId: parseInt(vacancyId),
      },
    },
  })

  res.json({
    success: true,
    message: 'Вакансия успешно удалена из избранного',
  })
}

/**
 * Получить избранные вакансии пользователя
 * @route GET /api/responses
 */
const getUserFavorites = async (req, res) => {

  const favorites = await prisma.response.findMany({
    where: { userId: req.user.id },
    include: {
      vacancy: {
        include: {
          employer: {
            select: {
              companyName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  res.json({
    success: true,
    data: favorites,
  })
}

/**
 * Проверить, находится ли вакансия в избранном у пользователя
 * @route GET /api/responses/check/:vacancyId
 */
const checkFavoriteStatus = async (req, res) => {

  const { vacancyId } = req.params
  const userId = req.user.id

  const favorite = await prisma.response.findUnique({
    where: {
      userId_vacancyId: {
        userId,
        vacancyId: parseInt(vacancyId),
      },
    },
  })

  res.json({
    success: true,
    data: {
      isFavorite: !!favorite,
    },
  })
}

module.exports = {
  addToFavorites: asyncHandler(addToFavorites),
  removeFromFavorites: asyncHandler(removeFromFavorites),
  getUserFavorites: asyncHandler(getUserFavorites),
  checkFavoriteStatus: asyncHandler(checkFavoriteStatus),
}