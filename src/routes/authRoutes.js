const express = require('express');
const { register, login, refresh, logout } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

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

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', refresh);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', auth, logout);


module.exports = router;