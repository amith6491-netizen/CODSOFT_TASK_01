/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    '172.17.5.66',
    '172.17.*.*',
    '192.168.*.*',
    'localhost',
    '127.0.0.1',
  ],
};

module.exports = nextConfig;
