/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["img.youtube.com", "i.ytimg.com"],
  },
};

export default nextConfig;
