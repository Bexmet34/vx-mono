import path from 'path';
import { fileURLToPath } from 'url';
import createMDX from 'fumadocs-mdx/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  serverExternalPackages: ['discord.js'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default withMDX(nextConfig);
