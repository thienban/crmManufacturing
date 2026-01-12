import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import config from './src/payload.config'

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default withPayload(nextConfig)
