/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Don't attempt to optimize images
  images: {
    unoptimized: true,
  },
  // Use standalone output to make deploys simpler
  output: 'standalone',
  // Transpile packages that need it
  transpilePackages: ['@hello-pangea/dnd'],
  // Suppress console warnings and errors during build
  onDemandEntries: {
    // Keep page in memory for this many ms (helps with dev hot reloading)
    maxInactiveAge: 25 * 1000,
    // Number of pages to keep in memory
    pagesBufferLength: 2,
  }
}

module.exports = nextConfig 