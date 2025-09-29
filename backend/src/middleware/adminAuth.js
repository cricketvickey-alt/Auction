export function adminAuth(req, res, next) {
  const required = process.env.ADMIN_TOKEN || ''
  if (!required) return res.status(500).json({ error: 'ADMIN_TOKEN not configured' })
  const token = req.headers['x-admin-token'] || ''
  if (token !== required) return res.status(401).json({ error: 'Unauthorized' })
  next()
}
