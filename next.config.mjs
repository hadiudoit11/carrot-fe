/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
      domains: ['tailwindui.com', 'images.unsplash.com'],
      remotePatterns: [
        { hostname: 'tailwindui.com' }, // Allow images from all paths on tailwindui.com
        { hostname: 'images.unsplash.com' }, // Allow images from all paths on images.unsplash.com
      ],
    },
  };
  
  export default nextConfig;
  