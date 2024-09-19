import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

export interface Settings {
  server: string;
  target?: {
    protocol: 'http:' | 'https';
    host: string;
    path: string;
    key: string;
    cert: string;
  };
  username: string;
  apitoken: string;
}

export const settings: Settings = JSON.parse(readFileSync("settings.json", "utf-8"));

const { target } = settings;
if (target) {
  if (target.key.indexOf("-----BEGIN") < 0) {
    target.key = readFileSync(target.key, "utf-8");
  }
  if (target.cert.indexOf("-----BEGIN") < 0) {
    target.cert = readFileSync(target.cert, "utf-8");
  }
}

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
        target: settings.target || settings.server,
        auth: `${settings.username}:${settings.apitoken}`,
        changeOrigin: true,
        cookieDomainRewrite: "",
        rewrite: (path) => path.replace("/backend", ""),
      },
    },
  },
});
