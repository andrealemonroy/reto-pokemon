import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const shared = {
  react: { singleton: true }, 'react/': { singleton: true },
  'react-dom': { singleton: true }, 'react-dom/': { singleton: true },
  'react-router-dom': { singleton: true }, '@tanstack/react-query': { singleton: true },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const detailEntry = env.VITE_DETAIL_REMOTE_URL ?? 'http://localhost:3001/remoteEntry.js';
  const historyEntry = env.VITE_HISTORY_REMOTE_URL ?? 'http://localhost:3002/remoteEntry.js';
  return {
    base: 'http://localhost:3000', server: { port: 3000, strictPort: true, origin: 'http://localhost:3000' },
    plugins: [react(), federation({
      name: 'pokemon_shell', shareStrategy: 'loaded-first',
      remotes: {
        remoteDetail: { type: 'module', name: 'pokemon_detail', entry: detailEntry },
        remoteHistory: { type: 'module', name: 'pokemon_history', entry: historyEntry },
      }, shared, dts: false,
    })],
    build: { target: 'chrome89' },
  };
});
