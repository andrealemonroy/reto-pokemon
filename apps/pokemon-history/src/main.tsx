import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@pokedex/ui/styles.css';
import PokemonHistory from './PokemonHistory';
const root = document.getElementById('root');
if (!root) throw new Error('Root element missing');
createRoot(root).render(
  <StrictMode>
    <PokemonHistory
      onPokemonSelect={(id) => location.assign(`http://localhost:3000/pokemon/${id}`)}
      onGoHome={() => location.assign('http://localhost:3000')}
    />
  </StrictMode>,
);
