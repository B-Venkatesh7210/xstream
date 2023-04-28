/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "huddle01-assets-frontend.s3.amazonaws.com",
      "gateway.lighthouse.storage",
      "ipfs.io",
    ],
  },
};

module.exports = nextConfig;
