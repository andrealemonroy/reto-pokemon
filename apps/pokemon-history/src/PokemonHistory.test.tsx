import { historyRepository } from '@pokedex/domain';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PokemonHistory from './PokemonHistory';

describe('PokemonHistory remote', () => {
  beforeEach(() => localStorage.clear());
  it('renders its empty state and home action', async () => {
    const onGoHome = vi.fn(); render(<PokemonHistory onPokemonSelect={() => undefined} onGoHome={onGoHome}/>);
    await userEvent.click(screen.getByRole('button', { name: 'Explorar Pokédex' }));
    expect(onGoHome).toHaveBeenCalledOnce();
  });
  it('renders persisted visits and selects by id', async () => {
    const onSelect = vi.fn();
    historyRepository?.registerVisit({ id: 25, name: 'pikachu', imageUrl: 'image.svg' }, 'open-1');
    render(<PokemonHistory onPokemonSelect={onSelect} onGoHome={() => undefined}/>);
    await userEvent.click(screen.getByRole('button', { name: /Abrir pikachu, 1 visitas/ }));
    expect(onSelect).toHaveBeenCalledWith(25);
  });
});
