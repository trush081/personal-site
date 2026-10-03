/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    // The Future Imperfect styles predate the Sass module system.
    silenceDeprecations: ['import', 'global-builtin', 'legacy-js-api', 'slash-div', 'color-functions', 'if-function'],
  },
};

export default nextConfig;
