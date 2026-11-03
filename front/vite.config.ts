import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const mockupDir = path.resolve(dirname, '../mockup');

export default defineConfig({
  // 로컬·Vercel 은 '/', GitHub Pages 빌드는 VITE_BASE_PATH=/portfolio/
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
      // 컬렉션별 목업 JSON (프론트 MSW + DB 시드의 단일 원본)
      '@mockup': mockupDir,
    },
  },
  server: {
    fs: { allow: [dirname, mockupDir] },
  },
  test: {
    environment: 'jsdom',
    setupFiles: 'src/test/setup.ts',
    globals: true,
    // Node 25+ 의 내장 localStorage 가 jsdom 의 것을 가리지 않도록 끈다
    poolOptions: {
      forks: { execArgv: ['--no-experimental-webstorage'] },
    },
  },
});
