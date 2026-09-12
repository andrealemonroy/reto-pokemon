import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeTheme } from '@pokedex/domain/theme';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@pokedex/ui/styles.css';
import './shell.css';
import { App } from './App';

initializeTheme();
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});
const root = document.getElementById('root');
if (!root) throw new Error('Root element missing');
createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
