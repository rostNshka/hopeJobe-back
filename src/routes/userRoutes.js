const express = require('express')
const { auth } = require('../middleware/auth')
const { validateProfileUpdate } = require('../middleware/validation')
const { getProfile, updateProfile, getUserStats } = require('../controllers/userController')

const router = express.Router()

/**
 * @route GET /api/users/stats
 * @desc Get users statistics (count)
 * @access Public
 */
router.get('/stats', getUserStats)

router.use(auth)

/**
 * @route GET /api/users/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', getProfile)

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', validateProfileUpdate, updateProfile)

module.exports = router