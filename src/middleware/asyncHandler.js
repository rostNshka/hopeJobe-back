const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (error) {
    console.error('❌ Ошибка:', error)

    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

module.exports = asyncHandler