import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    // In dev, /api/* is forwarded to the Nest server so cookies stay same-origin
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
