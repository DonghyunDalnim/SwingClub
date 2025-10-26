/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Use standalone output to avoid static generation issues
  output: 'standalone',
  // Disable static page generation for error pages
  generateBuildId: async () => {
    return 'swing-connect-build'
  },
}

module.exports = nextConfig
