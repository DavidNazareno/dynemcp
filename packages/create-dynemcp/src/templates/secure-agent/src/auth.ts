import { Request, Response, NextFunction } from 'express'

// This is an example authentication middleware.
// The dynemcp framework will automatically load and use it based on the path
// specified in `dynemcp.config.json`.
export default function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key']

  if (apiKey === 'my-secret-key') {
    console.log('✅ Client authenticated!')
    return next()
  }

  console.warn('🛑 Unauthorized: Missing or invalid API key.')
  res.status(401).send('Unauthorized')
}
