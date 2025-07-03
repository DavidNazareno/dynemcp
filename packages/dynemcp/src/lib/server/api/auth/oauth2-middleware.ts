import { auth } from 'express-oauth2-jwt-bearer'

/**
 * OAuth2/OIDC JWT Bearer middleware for DyneMCP.
 * @param options { issuerBaseURL, audience }
 * @returns Express middleware
 */
export function oauth2JwtMiddleware(options: {
  issuerBaseURL: string
  audience: string
}) {
  return auth({
    issuerBaseURL: options.issuerBaseURL,
    audience: options.audience,
    tokenSigningAlg: 'RS256', // or as required by your provider
  })
}
