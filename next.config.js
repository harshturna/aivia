/** @type {import('next').NextConfig} */
const nextConfig = {
  // next dev would otherwise append its own block to CLAUDE.md, which is ours.
  agentRules: false,
  // The dashboards and the two settings pages are gone (D-002); the per-tool pages go with
  // TICKET-007, which adds their redirects.
  async redirects() {
    return [
      { source: "/dashboard", destination: "/studio", permanent: true },
      { source: "/generative", destination: "/studio", permanent: true },
      {
        source: "/generative/settings",
        destination: "/settings",
        permanent: true,
      },
      {
        source: "/characters/settings",
        destination: "/settings",
        permanent: true,
      },
    ];
  },
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
