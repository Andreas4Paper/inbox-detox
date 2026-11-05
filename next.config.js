/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Prevent embedding in iframes (clickjacking protection)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Limit referrer info sent to third parties
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features not needed by this app
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // XSS protection for older browsers
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Force HTTPS for 1 year (only meaningful in production)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js needs unsafe-inline for styles; inline scripts for hydration
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      // Google OAuth redirect + Gmail API
      "connect-src 'self' https://www.googleapis.com https://accounts.google.com",
      // Google profile images
      "img-src 'self' data: https://lh3.googleusercontent.com",
      // Google OAuth popup/redirect
      "frame-src https://accounts.google.com",
      "form-action 'self' https://accounts.google.com",
    ].join('; '),
  },
]

// Static build for GitHub Pages (landing page + Impressum only).
// See .github/workflows/pages.yml, which removes the server-only routes first.
const PAGES_BASE_PATH = '/inbox-detox'

const pagesConfig = {
  output: 'export',
  basePath: PAGES_BASE_PATH,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_STATIC_SITE: '1',
    NEXT_PUBLIC_BASE_PATH: PAGES_BASE_PATH,
  },
}

const nextConfig = {
  serverExternalPackages: ['googleapis', 'google-auth-library'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

if (process.env.PAGES_BUILD === '1') {
  // Static exports cannot set response headers or optimize images.
  delete nextConfig.headers
  nextConfig.images = { unoptimized: true }
  Object.assign(nextConfig, pagesConfig)
}

module.exports = nextConfig
