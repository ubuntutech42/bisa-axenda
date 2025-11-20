
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    // allowedDevOrigins has been moved to the root level
  },
  allowedDevOrigins: [
    "https://6000-firebase-studio-1759897343276.cluster-zhw3w37rxzgkutusbbhib6qhra.cloudworkstations.dev",
  ],
};

export default nextConfig;
