/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.iredjournal.org' }],
        destination: 'https://iredjournal.org/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
