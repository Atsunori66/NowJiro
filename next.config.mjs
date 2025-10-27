/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint: {
  //   // ビルド時のESLintを無効化（開発効率を優先）
  //   ignoreDuringBuilds: true,
  // },
  typescript: {
    // ビルド時のTypeScriptエラーを無視
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
