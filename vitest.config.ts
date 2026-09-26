import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // Add this line to ignore Playwright directories
    exclude: ['**/node_modules/**', '**/e2e/**', '**/tests/**'], 
  }
})