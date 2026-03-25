export const auth = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' })

    next()
  }
}