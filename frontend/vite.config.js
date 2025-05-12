import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const apiHost = env.VITE_API_HOST || 'localhost';
  const apiPort = env.VITE_API_PORT || '8000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: `http://${apiHost}:${apiPort}`,
          changeOrigin: true
        }
      }
    }
  };
});
