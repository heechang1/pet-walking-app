/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Windows 파일 시스템 잠금 문제 해결
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // 개발 모드 최적화 및 Windows 파일 잠금 문제 완화
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "mapbox-gl": "maplibre-gl",
    };
    
    // Windows에서 파일 감시 문제 해결
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    
    return config;
  },
  // 개발 모드에서 파일 시스템 안정성 향상
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;



