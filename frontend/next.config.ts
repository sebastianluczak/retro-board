import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gravatar.com',
        port: '',
        pathname: '/avatar/**',
        search: '?d=initials',
      },
      {
        hostname: 'mir-s3-cdn-cf.behance.net',
      },
    ],
  },
};

export default nextConfig;
