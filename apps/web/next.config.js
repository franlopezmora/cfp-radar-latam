/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
      '@/lib': require('path').resolve(__dirname, 'src/lib'),
    };
    return config;
  },
}

module.exports = nextConfig
