


/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  // basePath و assetPrefix يجب أن يكونا فارغين للنشر على الجذر
  basePath: "",
  assetPrefix: "",
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
