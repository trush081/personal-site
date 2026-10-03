/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    // The Future Imperfect styles predate the Sass module system.
    silenceDeprecations: ['import', 'global-builtin', 'legacy-js-api', 'slash-div', 'color-functions', 'if-function'],
  },
  // The CMS used to live under /admin.
  redirects: async () => [
    { source: '/admin', destination: '/dashboard', permanent: true },
    { source: '/admin/login', destination: '/login', permanent: true },
    { source: '/admin/:section', destination: '/dashboard/content/:section', permanent: true },
  ],
};

export default nextConfig;
