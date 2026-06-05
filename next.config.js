/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf|hdr|exr)$/,
      use: { loader: 'file-loader', options: { publicPath: '/_next/static/files', outputPath: 'static/files', name: '[name].[hash].[ext]' } },
    });
    return config;
  },
  experimental: { optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei'] },
};
module.exports = nextConfig;
