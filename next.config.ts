import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import config from './src/payload.config'

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  }
}

export default withPayload(nextConfig)
