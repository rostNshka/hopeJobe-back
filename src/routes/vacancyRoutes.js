const express = require('express')
const { auth, requireEmployer } = require('../middleware/auth')
const {
  validateVacancy,
  validateVacancyUpdate,
  validateVacancyId,
  validatePagination
} = require('../middleware/validation')
const {
  createVacancy,
  getAllVacancies,
  getVacancyById,
  getEmployerVacancies,
  updateVacancy,
  deleteVacancy
} = require('../controllers/vacancyController')

const router = express.Router()

/**
 * @route GET /api/vacancies
 * @desc Get all vacancies with pagination
 * @access Public
 */
router.get('/', validatePagination, getAllVacancies)

/**
 * @route GET /api/vacancies/:id
 * @desc Get vacancy by ID
 * @access Public
 */
router.get('/:id', validateVacancyId, getVacancyById)

router.use(auth)

/**
 * @route GET /api/vacancies/employer/my-vacancies
 * @desc Get all vacancies for the authenticated employer
 * @access Private (Employer only)
 */
router.get('/employer/my-vacancies', requireEmployer, validatePagination, getEmployerVacancies)

/**
 * @route POST /api/vacancies
 * @desc Create a new vacancy
 * @access Private (Employer only)
 */
router.post('/', requireEmployer, validateVacancy, createVacancy)

/**
 * @route PUT /api/vacancies/:id
 * @desc Update a vacancy
 * @access Private (Employer only)
 */
router.put('/:id', requireEmployer, validateVacancyUpdate, updateVacancy)

/**
 * @route DELETE /api/vacancies/:id
 * @desc Delete a vacancy
 * @access Private (Employer only)
 */
router.delete('/:id', requireEmployer, validateVacancyId, deleteVacancy)

module.exports = router