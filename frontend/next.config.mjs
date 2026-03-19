/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        // Redirect old /courses/:classId/:subjectId/:chapterId to new animated-videos path
        // Only matches chapterIds that are NOT one of the content type slugs
        source: "/courses/:classId/:subjectId/:chapterId((?!animated-videos|lecture-videos|notes|quiz|board-papers|live-classes)[^/]+)",
        destination: "/courses/:classId/:subjectId/animated-videos/:chapterId",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
