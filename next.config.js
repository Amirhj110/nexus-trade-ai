/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  distDir: 'dist',
  basePath: '/nexus-trade-ai',
  assetPrefix: '/nexus-trade-ai',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig