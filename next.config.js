const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: [
    '172.17.5.66',
    '172.17.*.*',
    '192.168.*.*',
    'localhost',
    '127.0.0.1',
  ],
};

module.exports = nextConfig;
