/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@showroom/ui', '@showroom/types'],
  images: {
    domains: ['images.unsplash.com', 'cdn.pixabay.com', 'localhost'],
  },
};

module.exports = nextConfig;
