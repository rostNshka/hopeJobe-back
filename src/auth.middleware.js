export const auth = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    next(); // вызываем next после успешной проверки
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}