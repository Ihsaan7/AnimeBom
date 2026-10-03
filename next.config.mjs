/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'cdn.myanimelist.net',
      'api.jikan.moe',
      'kitsu.io',
      'media.kitsu.app',
      'img.youtube.com',
      's4.anilist.co',
      'images.unsplash.com'
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
