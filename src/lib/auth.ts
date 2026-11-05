import type { NextAuthOptions } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import { getToken } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'
import type { NextRequest } from 'next/server'

// Google access tokens last about an hour. We deliberately request no refresh token,
// so Gmail access ends with the session and users sign in again afterwards.
const SESSION_MAX_AGE_SECONDS = 60 * 60

function hasValidAccessToken(token: JWT): boolean {
  return !!token.accessToken && !!token.expiresAt && token.expiresAt * 1000 > Date.now()
}

/** Returns the signed-in user's Gmail access token. It never leaves the server. */
export async function getGmailAccessToken(request: NextRequest): Promise<string | null> {
  const token = await getToken({ req: request })
  return token && hasValidAccessToken(token) ? token.accessToken! : null
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
          ].join(' '),
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          name: token.name,
          email: token.email,
          picture: token.picture,
          sub: token.sub,
          accessToken: account.access_token,
          expiresAt: account.expires_at,
        }
      }
      // Reading the session extends the cookie, so end it explicitly with the Google token.
      // NextAuth clears the session cookie when this callback throws.
      if (!hasValidAccessToken(token)) {
        throw new Error('Gmail access expired')
      }
      return token
    },
    // The access token stays in the encrypted cookie and is deliberately not added
    // to the client-visible session.
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
