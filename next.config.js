/** @type {import('next').NextConfig} */
const nextConfig = {
  // next dev would otherwise append its own block to CLAUDE.md, which is ours.
  agentRules: false,
  images: {
    remotePatterns: [
      // Cloudinary holds character portraits and transformation uploads.
      { protocol: "https", hostname: "res.cloudinary.com" },
      // fal serves generated assets from its own CDN.
      { protocol: "https", hostname: "**.fal.media" },
      { protocol: "https", hostname: "fal.media" },
    ],
  },
};

module.exports = nextConfig;
