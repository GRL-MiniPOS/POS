import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      // 後端圖片資產來源（assets 由後端同主機提供；若資產改由其他主機/CDN 服務需調整）
      {
        protocol: 'https',
        hostname: 'pos-backend-production-2ccc.up.railway.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8002',
      },
      {
        protocol: 'http',
        hostname: 'pos-backend-production-2ccc.up.railway.app',
      },
    ],
  },
}

export default nextConfig
