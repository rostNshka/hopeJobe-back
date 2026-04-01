const express = require('express');
const { register, login } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user (candidate or employer)
 * @access Public
 */
router.post('/register', validateRegistration, register);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', validateLogin, login);

module.exports = router;