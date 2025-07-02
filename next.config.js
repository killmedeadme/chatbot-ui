const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost"
      },
      {
        protocol: "http",
        hostname: "127.0.0.1"
      },
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ["sharp", "onnxruntime-node"]
  }
}

// ✅ PWA機能は完全に外す → `withPWA` を消す
module.exports = withBundleAnalyzer(nextConfig)
