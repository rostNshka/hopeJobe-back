const express = require('express')
const { auth } = require('../middleware/auth')
const {
  validateAddToFavorites,
  validateRemoveFromFavorites,
  validateVacancyId
} = require('../middleware/validation')
const {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkFavoriteStatus
} = require('../controllers/responseController')

const router = express.Router()

// All routes require authentication
router.use(auth)

/**
 * @route GET /api/responses
 * @desc Get user's favorite vacancies
 * @access Private
 */
router.get('/', getUserFavorites)

/**
 * @route POST /api/responses
 * @desc Add vacancy to favorites
 * @access Private
 */
router.post('/', validateAddToFavorites, addToFavorites)

/**
 * @route DELETE /api/responses/:vacancyId
 * @desc Remove vacancy from favorites
 * @access Private
 */
router.delete('/:vacancyId', validateRemoveFromFavorites, removeFromFavorites)

/**
 * @route GET /api/responses/check/:vacancyId
 * @desc Check if vacancy is in user's favorites
 * @access Private
 */
router.get('/check/:vacancyId', validateVacancyId, checkFavoriteStatus)

module.exports = router