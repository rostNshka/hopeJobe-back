const prisma = require('../../prisma-backup.js')

/**
 * Create a new vacancy
 * @route POST /api/vacancies
 */
const createVacancy = async (req, res) => {
  try {
    const { title, location, description, workType, salary } = req.body
    const employerId = req.employer.id

    const vacancy = await prisma.vacancy.create({
      data: {
        title,
        location,
        description,
        workType,
        salary: salary || null,
        employerId
      },
      include: {
        employer: {
          select: {
            companyName: true,
            email: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      data: vacancy
    })
  } catch (error) {
    console.error('Ошибка создания вакансии:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании вакансии',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Get all vacancies with pagination
 * @route GET /api/vacancies
 */
const getAllVacancies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [vacancies, total] = await Promise.all([
      prisma.vacancy.findMany({
        skip,
        take: limit,
        include: {
          employer: {
            select: {
              companyName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.vacancy.count()
    ])

    res.json({
      success: true,
      data: vacancies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Ошибка получения вакансий:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении вакансий',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Get vacancy by ID
 * @route GET /api/vacancies/:id
 */
const getVacancyById = async (req, res) => {
  try {
    const { id } = req.params

    const vacancy = await prisma.vacancy.findUnique({
      where: { id: parseInt(id) },
      include: {
        employer: {
          select: {
            companyName: true,
            email: true,
            description: true
          }
        },
        responses: {
          select: {
            id: true,
            userId: true,
            createdAt: true
          }
        }
      }
    })

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Вакансия не найдена'
      })
    }

    res.json({
      success: true,
      data: vacancy
    })
  } catch (error) {
    console.error('Ошибка получения вакансии:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении вакансии',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Get employer's vacancies
 * @route GET /api/vacancies/employer/my-vacancies
 */
const getEmployerVacancies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [vacancies, total] = await Promise.all([
      prisma.vacancy.findMany({
        where: { employerId: req.employer.id },
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
                      email: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.vacancy.count({
        where: { employerId: req.employer.id }
      })
    ])

    res.json({
      success: true,
      data: vacancies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Ошибка получения вакансий работодателя:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении вакансий работодателя',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Update vacancy
 * @route PUT /api/vacancies/:id
 */
const updateVacancy = async (req, res) => {
  try {
    const { id } = req.params
    const { title, location, description, workType, salary } = req.body

    const vacancy = await prisma.vacancy.findFirst({
      where: {
        id: parseInt(id),
        employerId: req.employer.id
      }
    })

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Вакансия не найдена или у вас нет прав для её обновления'
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
            email: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: updatedVacancy
    })
  } catch (error) {
    console.error('Ошибка обновления вакансии:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении вакансии',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Delete vacancy
 * @route DELETE /api/vacancies/:id
 */
const deleteVacancy = async (req, res) => {
  try {
    const { id } = req.params

    const vacancy = await prisma.vacancy.findFirst({
      where: {
        id: parseInt(id),
        employerId: req.employer.id
      }
    })

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Вакансия не найдена или у вас нет прав для её удаления'
      })
    }

    await prisma.vacancy.delete({
      where: { id: parseInt(id) }
    })

    res.json({
      success: true,
      message: 'Вакансия успешно удалена'
    })
  } catch (error) {
    console.error('Ошибка удаления вакансии:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении вакансии',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

module.exports = {
  createVacancy,
  getAllVacancies,
  getVacancyById,
  getEmployerVacancies,
  updateVacancy,
  deleteVacancy
}