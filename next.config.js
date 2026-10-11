/** @type {import('next').NextConfig} */
const nextConfig = {
  // next dev would otherwise append its own block to CLAUDE.md, which is ours.
  agentRules: false,
  // The owner checks the dev server from another machine on the LAN (TICKET-024).
  allowedDevOrigins: ["192.168.2.20"],
  // The dashboards, the two settings pages and the per-tool pages are gone (D-002);
  // the tools are modes of the Studio now.
  async redirects() {
    return [
      { source: "/dashboard", destination: "/studio", permanent: true },
      // a session is a project now, at its own address (D-005, TICKET-062)
      { source: "/studio/:id", destination: "/p/:id", permanent: true },
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
      { source: "/conversation", destination: "/studio", permanent: true },
      { source: "/code", destination: "/studio", permanent: true },
      { source: "/documents", destination: "/studio", permanent: true },
      { source: "/image", destination: "/studio?mode=image", permanent: true },
      { source: "/video", destination: "/studio?mode=video", permanent: true },
      { source: "/music", destination: "/studio?mode=music", permanent: true },
      {
        source: "/transformations/:tool",
        destination: "/edit?tool=:tool",
        permanent: true,
      },
      {
        source: "/characters/chat/:id",
        destination: "/characters/c/:id",
        permanent: true,
      },
    ];
  },
  images: {
    // AVIF first: the landing plates are large and AVIF halves them at the same look (TICKET-021).
    formats: ["image/avif", "image/webp"],
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
