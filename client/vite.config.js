import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   // BENEFITS OF PROXY:
  //   // - avoid CORS issues (the proxy makes it seem like your requests are coming from the same origin as the backend server).
  //   // - simplified API calls (no need to hardcode full URLs in your frontend code. Simply use relative paths like '/api/users').
  //   // - flexible development setup (switch backend servers easily by updating the 'target' value in your config).
  //   proxy: {
  //     // Proxy Key: the '/api' key tells Vite to intercept any requests starting with /api.
  //     '/api': {
  //       // Target Option: requests matching /api are forwarded to Backend server address http://localhost:5000.
  //       target: 'http://localhost:5000',
  //       // Ensures that the proxy adjusts the Host header to match the target server (basically, ensures the request is coming from frontend server).
  //       changeOrigin: true,
  //       // // Modifies the request path before forwarding. For example, '/api/users' becomes '/users'.
  //       // rewrite: (path) => path.replace(/^\/api/, ''), // Optional: remove '/api' prefix.
  //     },
  //   }
  // }
});
