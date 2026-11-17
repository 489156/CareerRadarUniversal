/** @type {import('next').NextConfig} */
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const basePath = rawBasePath && rawBasePath !== '/' ? rawBasePath.replace(/\/$/, '') : '';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  ...(basePath ? { basePath } : {}),
  images: { unoptimized: true },
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
