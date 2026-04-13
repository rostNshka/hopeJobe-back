const { body, param, query, validationResult } = require('express-validator')
const { validateEmail, validatePassword } = require('../utils/validation')
const prisma = require('../../prisma-backup.js')

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Ошибка валидации',
      errors: errors.array()
    })
  }
  next()
}

const customEmailValidator = (value) => {
  if (!validateEmail(value)) {
    throw new Error('Неверный формат почты')
  }
  return true
}

const customPasswordValidator = (value) => {
  if (!validatePassword(value)) {
    throw new Error('Пароль должен содержать больше 6 символов')
  }
  return true
}

const validateRegistration = [
  body('email')
    .notEmpty()
    .withMessage('Требуется электронная почта')
    .custom(customEmailValidator)
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      if (existingUser) {
        throw new Error('Электронная почта уже используется');
      }
      return true
    }),

  body('password')
    .notEmpty()
    .withMessage('Требуется пароль')
    .custom(customPasswordValidator)
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Пароль должен содержать как минимум одну букву и одну цифру'),

  body('role')
    .isIn(['USER', 'EMPLOYER'])
    .withMessage('Роль должна быть либо ПОЛЬЗОВАТЕЛЕМ, либо РАБОТОДАТЕЛЕМ'),

  body('firstName')
    .if(body('role').equals('USER'))
    .notEmpty()
    .withMessage('Для кандидатов требуется имя')
    .isLength({ min: 2, max: 50 })
    .withMessage('Длина имени должна составлять от 2 до 50 символов'),

  body('lastName')
    .if(body('role').equals('USER'))
    .notEmpty()
    .withMessage('Фамилия обязательна для кандидатов')
    .isLength({ min: 2, max: 50 })
    .withMessage('Длина фамилии должна составлять от 2 до 50 символов'),

  body('patronymic')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Длина отчества должна составлять не более 50 символов'),

  body('companyName')
    .if(body('role').equals('EMPLOYER'))
    .notEmpty()
    .withMessage('Название компании обязательно для работодателей')
    .isLength({ min: 2, max: 100 })
    .withMessage('Название компании должно содержать от 2 до 100 символов'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Описание должно содержать не более 500 символов'),

  handleValidationErrors
]

const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Требуется электронная почта')
    .custom(customEmailValidator)
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Требуется ввести пароль'),

  handleValidationErrors
]

const validateVacancy = [
  body('title')
    .notEmpty()
    .withMessage('Требуется название')
    .isLength({ min: 3, max: 100 })
    .withMessage('Название должно содержать от 3 до 100 символов'),

  body('location')
    .notEmpty()
    .withMessage('Требуется местоположение')
    .isLength({ min: 2, max: 100 })
    .withMessage('Длина расположения должна составлять от 2 до 100 символов'),

  body('description')
    .notEmpty()
    .withMessage('Требуется описание')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Объем описания должен составлять от 10 до 2000 символов'),

  body('workType')
    .isIn(['REMOTE', 'OFFICE', 'HYBRID'])
    .withMessage('Тип работы должен быть УДАЛЕННЫМ, ОФИСНЫМ или ГИБРИДНЫМ'),

  body('salary')
    .optional()
    .isString()
    .withMessage('Зарплата должна быть указана')
    .isLength({ max: 50 })
    .withMessage('Зарплата должна быть не более 50 знаков'),

  handleValidationErrors
]

const validateVacancyUpdate = [
  param('id')
    .isInt()
    .withMessage('Неверный идентификатор вакансии')
    .toInt(),

  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Заголовок должен содержать от 3 до 100 символов'),

  body('location')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Локация должна быть от 2 до 100 символов'),

  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Объем описания должен составлять от 10 до 2000 символов'),

  body('workType')
    .optional()
    .isIn(['REMOTE', 'OFFICE', 'HYBRID'])
    .withMessage('Тип работы должен быть УДАЛЕННЫМ, ОФИСНЫМ или ГИБРИДНЫМ'),

  body('salary')
    .optional()
    .isString()
    .withMessage('Зарплата должна быть указана'),

  handleValidationErrors
]

const validateAddToFavorites = [
  body('vacancyId')
    .isInt()
    .withMessage('Неверный идентификатор вакансии')
    .toInt(),

  handleValidationErrors
]

const validateRemoveFromFavorites = [
  param('vacancyId')
    .isInt()
    .withMessage('Неверный идентификатор вакансии')
    .toInt(),

  handleValidationErrors
]

const validateVacancyId = [
  param('id')
    .isInt()
    .withMessage('Неверный идентификатор вакансии')
    .toInt(),

  handleValidationErrors
]

const validateProfileUpdate = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно содержать от 2 до 50 символов'),

  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Фамилия должна содержать от 2 до 50 символов'),

  body('patronymic')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Отчество не должно превышать 50 символов'),

  body('companyName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Название компании должно содержать от 2 до 100 символов'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Описание не должно превышать 500 символов'),

  handleValidationErrors
]

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Номер страницы должен быть положительным целым числом')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит записей должен быть от 1 до 100')
    .toInt(),

  handleValidationErrors
]

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateVacancy,
  validateVacancyUpdate,
  validateAddToFavorites,
  validateRemoveFromFavorites,
  validateVacancyId,
  validateProfileUpdate,
  validatePagination
}