import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
const shared = { react: { singleton: true }, 'react/': { singleton: true }, 'react-dom': { singleton: true }, 'react-dom/': { singleton: true }, 'react-router-dom': { singleton: true }, '@tanstack/react-query': { singleton: true } };
export default defineConfig({
  base: 'http://localhost:3001', server: { port: 3001, strictPort: true, origin: 'http://localhost:3001' },
  plugins: [react(), federation({ name: 'pokemon_detail', filename: 'remoteEntry.js', exposes: { './PokemonDetail': './src/PokemonDetail.tsx' }, shared, dts: false })],
  build: { target: 'chrome89' },
});
