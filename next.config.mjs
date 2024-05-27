/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["tailwindui.com", "images.unsplash.com"],
  },
  experimental: {
    swcMinify: true,
    swcLoader: true,
  },
};

export default nextConfig;