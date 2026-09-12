import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@pokedex/ui/styles.css';
import PokemonDetail from './PokemonDetail';

const client = new QueryClient();
const root = document.getElementById('root');
if (!root) throw new Error('Root element missing');
createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <PokemonDetail
        pokemonId={25}
        visitKey={`standalone:${crypto.randomUUID()}`}
        onBack={() => history.back()}
      />
    </QueryClientProvider>
  </StrictMode>,
);
