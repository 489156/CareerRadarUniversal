/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cloudflare Pages / Static Hosting friendly
  output: process.env.NEXT_EXPORT ? 'export' : undefined,
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
