/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    // The Future Imperfect styles predate the Sass module system.
    silenceDeprecations: ['import', 'global-builtin', 'legacy-js-api', 'slash-div', 'color-functions', 'if-function'],
  },
  // Baseline security headers on every response. frame-ancestors (plus X-Frame-Options for
  // old browsers) stops other sites from framing /login and /oauth/consent to trick people
  // into clicking "Sign in" or "Allow". The CSP sets only frame-ancestors on purpose: a full
  // script policy needs nonces for Next's inline scripts and Google Analytics.
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
      ],
    },
  ],
  // The CMS used to live under /admin.
  redirects: async () => [
    { source: '/admin', destination: '/dashboard', permanent: true },
    { source: '/admin/login', destination: '/login', permanent: true },
    { source: '/admin/:section', destination: '/dashboard/content/:section', permanent: true },
  ],
};

export default nextConfig;
