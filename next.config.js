/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
    remotePatterns: [
      // fal serves generated assets from its own CDN.
      { protocol: "https", hostname: "**.fal.media" },
      { protocol: "https", hostname: "fal.media" },
    ],
  },
};

module.exports = nextConfig;
