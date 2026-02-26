import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'swr$': path.resolve(process.cwd(), 'node_modules/swr/dist/index/index.mjs'),
      'swr/infinite$': path.resolve(process.cwd(), 'node_modules/swr/dist/infinite/index.mjs'),
    }
    return config
  },
}

export default nextConfig
