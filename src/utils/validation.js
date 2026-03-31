const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password) => {
  if (typeof password !== "string") return false
  return password && password.length >= 6
}

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/
  return phoneRegex.test(phone)
};

const validateUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateUrl
}