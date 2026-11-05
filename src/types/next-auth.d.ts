import 'next-auth/jwt'

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    /** Expiry of the Google access token, in seconds since the epoch. */
    expiresAt?: number
  }
}
