/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
      { protocol: "https", hostname: "vumbnail.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Force all traffic onto the registered domain (visuallearning.in) so Razorpay
  // never sees payments originate from the unregistered *.vercel.app URL.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "visuallearning-webapp.vercel.app" }],
        destination: "https://www.visuallearning.in/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
