import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

export interface Settings {
  server: string;
  username: string;
  apitoken: string;
}

export const settings: Settings = JSON.parse(readFileSync("settings.json", "utf-8"));

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    JENKINS_SERVER: JSON.stringify(settings.server),
  },
  plugins: [react()],
  server: {
    port: 1667,
    proxy: {
      "/backend/": {
        target: settings.server,
        auth: `${settings.username}:${settings.apitoken}`,
        changeOrigin: true,
        cookieDomainRewrite: "",
        rewrite: (path) => path.replace("/backend", ""),
      },
    },
  },
});
