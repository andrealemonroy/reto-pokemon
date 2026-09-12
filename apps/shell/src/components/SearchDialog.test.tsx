import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchDialog } from './SearchDialog';

const detailResponse = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  base_experience: 112,
  types: [],
  abilities: [],
  stats: [],
  sprites: { front_default: 'sprite.png' },
};
function renderDialog() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <SearchDialog onClose={() => undefined} onSelect={() => undefined} />
    </QueryClientProvider>,
  );
}

describe('SearchDialog', () => {
  beforeEach(() => vi.restoreAllMocks());
  it('loads the initial page and performs normalized exact search', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/pokemon?'))
        return Promise.resolve(
          new Response(
            JSON.stringify({
              count: 1,
              next: null,
              results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
            }),
            { status: 200 },
          ),
        );
      return Promise.resolve(new Response(JSON.stringify(detailResponse), { status: 200 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    renderDialog();
    expect(
      await screen.findByRole('button', { name: 'Ver detalle de bulbasaur' }),
    ).toBeInTheDocument();
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Nombre exacto del Pokémon' }),
      ' PÍKACHU ',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(
      await screen.findByRole('button', { name: 'Ver detalle de pikachu' }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/pokemon/pikachu'),
      expect.anything(),
    );
  });
  it('treats 404 as not found rather than infrastructure failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation((url: string) =>
          Promise.resolve(
            new Response(
              url.includes('/missing') ? '' : JSON.stringify({ count: 0, next: null, results: [] }),
              { status: url.includes('/missing') ? 404 : 200 },
            ),
          ),
        ),
    );
    renderDialog();
    const input = screen.getByRole('textbox', { name: 'Nombre exacto del Pokémon' });
    await userEvent.type(input, 'missing');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('heading', { name: 'No encontrado' })).toBeInTheDocument();
  });
});
