/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint during `next build`. Useful to avoid failing builds from lint rules.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
