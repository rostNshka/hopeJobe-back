const prisma = require('../../prisma-backup.js')
const asyncHandler = require('../middleware/asyncHandler')

/**
 * Create a new vacancy
 * @route POST /api/vacancies
 */
const createVacancy = async (req, res) => {
  const { title, location, description, workType, salary } = req.body
  const employerId = req.employer.id

  const vacancy = await prisma.vacancy.create({
    data: {
      title,
      location,
      description,
      workType,
      salary: salary || null,
      employerId,
    },
    include: {
      employer: {
        select: {
          companyName: true,
          email: true,
        },
      },
    },
  })

  res.status(201).json({
    data: vacancy,
  })
}

/**
 * Get all vacancies with pagination and search
 * @route GET /api/vacancies
 */
const getAllVacancies = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 9
  const skip = (page - 1) * limit
  const search = req.query.search || ''

  const whereCondition = search ? {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
      {
        employer: {
          companyName: { contains: search, mode: 'insensitive' }
        }
      }
    ]
  } : {}

  const [vacancies, total] = await Promise.all([
    prisma.vacancy.findMany({
      where: whereCondition,
      skip,
      take: limit,
      include: {
        employer: {
          select: {
            companyName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.vacancy.count({
      where: whereCondition,
    }),
  ])

  res.json({
    data: vacancies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

/**
 * Get vacancy by ID
 * @route GET /api/vacancies/:id
 */
const getVacancyById = async (req, res) => {
  const { id } = req.params

  const vacancy = await prisma.vacancy.findUnique({
    where: { id: parseInt(id) },
    include: {
      employer: {
        select: {
          companyName: true,
          email: true,
          description: true,
        },
      },
      responses: {
        select: {
          id: true,
          userId: true,
          createdAt: true,
        },
      },
    },
  })

  if (!vacancy) {
    return res.status(404).json({
      message: 'Вакансия не найдена',
    })
  }

  res.json({
    data: vacancy,
  })
}

/**
 * Get employer's vacancies with search
 * @route GET /api/vacancies/employer/my-vacancies
 */
const getEmployerVacancies = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit
  const search = req.query.search || ''

  const whereCondition = {
    employerId: req.employer.id,
    ...(search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    } : {})
  }

  const [vacancies, total] = await Promise.all([
    prisma.vacancy.findMany({
      where: whereCondition,
      skip,
      take: limit,
      include: {
        responses: {
          include: {
            user: {
              include: {
                candidate: {
                  select: {
                    firstName: true,
                    lastName: true,
                    patronymic: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.vacancy.count({
      where: whereCondition,
    }),
  ])

  res.json({
    data: vacancies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

/**
 * Update vacancy
 * @route PUT /api/vacancies/:id
 */
const updateVacancy = async (req, res) => {
  const { id } = req.params
  const { title, location, description, workType, salary } = req.body

  const vacancy = await prisma.vacancy.findFirst({
    where: {
      id: parseInt(id),
      employerId: req.employer.id,
    },
  })

  if (!vacancy) {
    return res.status(404).json({
      message: 'Вакансия не найдена или у вас нет прав для её обновления',
    })
  }

  const updateData = {}
  if (title !== undefined) updateData.title = title
  if (location !== undefined) updateData.location = location
  if (description !== undefined) updateData.description = description
  if (workType !== undefined) updateData.workType = workType
  if (salary !== undefined) updateData.salary = salary

  const updatedVacancy = await prisma.vacancy.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      employer: {
        select: {
          companyName: true,
          email: true,
        },
      },
    },
  })

  res.json({
    data: updatedVacancy,
  })
}

/**
 * Delete vacancy
 * @route DELETE /api/vacancies/:id
 */
const deleteVacancy = async (req, res) => {

  const { id } = req.params

  const vacancy = await prisma.vacancy.findFirst({
    where: {
      id: parseInt(id),
      employerId: req.employer.id,
    },
  })

  if (!vacancy) {
    return res.status(404).json({
      message: 'Вакансия не найдена или у вас нет прав для её удаления',
    })
  }

  await prisma.vacancy.delete({
    where: { id: parseInt(id) },
  })

  res.json({
    message: 'Вакансия успешно удалена',
  })
}

module.exports = {
  createVacancy: asyncHandler(createVacancy),
  getAllVacancies: asyncHandler(getAllVacancies),
  getVacancyById: asyncHandler(getVacancyById),
  getEmployerVacancies: asyncHandler(getEmployerVacancies),
  updateVacancy: asyncHandler(updateVacancy),
  deleteVacancy: asyncHandler(deleteVacancy),
}