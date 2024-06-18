/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["tailwindui.com", "images.unsplash.com"],
  },
  experimental: {
    swcMinify: true,
    swcLoader: true,
  },
  reactStrictMode: false,
};

export default nextConfig;