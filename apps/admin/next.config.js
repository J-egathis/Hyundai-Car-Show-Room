/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@showroom/ui', '@showroom/types'],
};

module.exports = nextConfig;
