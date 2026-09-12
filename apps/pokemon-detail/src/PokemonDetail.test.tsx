import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { historyRepository } from '@pokedex/domain/history';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PokemonDetail from './PokemonDetail';

const response = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  base_experience: 112,
  types: [{ slot: 1, type: { name: 'electric', url: '' } }],
  abilities: [{ ability: { name: 'static', url: '' }, is_hidden: false }],
  stats: [{ base_stat: 35, stat: { name: 'hp', url: '' } }],
  sprites: { front_default: 'sprite.png', other: { dream_world: { front_default: 'art.svg' } } },
};

describe('PokemonDetail remote', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  it('renders fetched data and registers one visit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })),
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <PokemonDetail pokemonId={25} visitKey="route-25" onBack={() => undefined} />
      </QueryClientProvider>,
    );
    expect(await screen.findByRole('heading', { name: /pikachu/i })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'HP' })).toHaveAttribute('aria-valuenow', '35');
    await waitFor(() => expect(historyRepository?.getAll()[0]?.visits).toBe(1));
  });
  it('shows an actionable network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <PokemonDetail pokemonId={25} visitKey="route-25" onBack={() => undefined} />
      </QueryClientProvider>,
    );
    expect(await screen.findByRole('alert', undefined, { timeout: 5000 })).toHaveTextContent(
      'El detalle no está disponible',
    );
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
