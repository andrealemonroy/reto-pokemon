import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
const shared = { react: { singleton: true }, 'react/': { singleton: true }, 'react-dom': { singleton: true }, 'react-dom/': { singleton: true }, 'react-router-dom': { singleton: true }, '@tanstack/react-query': { singleton: true } };
export default defineConfig({
  base: 'http://localhost:3002', server: { port: 3002, strictPort: true, origin: 'http://localhost:3002' },
  plugins: [react(), federation({ name: 'pokemon_history', filename: 'remoteEntry.js', exposes: { './PokemonHistory': './src/PokemonHistory.tsx' }, shared, dts: false })],
  build: { target: 'chrome89' },
});
