/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["img.youtube.com", "i.ytimg.com"],
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
