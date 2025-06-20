/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ビルド時のESLintを無効化（開発効率を優先）
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
