/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone 모드 제거 - 일반 배포 방식 사용
  experimental: {
    // App Router는 기본적으로 활성화됨
  },
  // 프로덕션 최적화
  swcMinify: true,
  compress: true,
}

module.exports = nextConfig