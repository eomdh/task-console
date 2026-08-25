import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // 첫 테스트가 생기기 전에도 완료 기준 게이트(test:run)가 동작해야 한다
    passWithNoTests: true,
    // 기본 5초는 setup의 asyncUtilTimeout(5초)이 다 쓰이기 전에 먼저 끊긴다
    testTimeout: 15_000,
  },
})
