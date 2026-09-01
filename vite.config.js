import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const GITHUB_PAGES_BASE = '/st-pauls-malayalam-choir-pune/';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://127.0.0.1:4000';
  const forGithubPages = process.env.GITHUB_PAGES === 'true';

  return {
    base: forGithubPages ? GITHUB_PAGES_BASE : '/',
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
