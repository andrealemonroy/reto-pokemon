import { beforeEach, describe, expect, it } from 'vitest';
import { LocalStoragePokemonHistoryRepository } from './history';

describe('LocalStoragePokemonHistoryRepository', () => {
  let counter = 0;
  let repository: LocalStoragePokemonHistoryRepository;
  beforeEach(() => {
    localStorage.clear();
    counter = 0;
    repository = new LocalStoragePokemonHistoryRepository(
      localStorage,
      () => new Date(`2025-01-0${++counter}T00:00:00Z`),
      () => `visit-${counter}`,
    );
  });
  it('creates, increments and deduplicates entries', () => {
    repository.registerVisit({ id: 25, name: 'pikachu', imageUrl: 'image' }, 'open-1');
    repository.registerVisit({ id: 25, name: 'pikachu', imageUrl: 'image' }, 'open-2');
    repository.registerVisit({ id: 1, name: 'bulbasaur', imageUrl: 'image' }, 'open-3');
    expect(repository.getAll()).toHaveLength(2);
    expect(repository.getAll().find(({ id }) => id === 25)?.visits).toBe(2);
    expect(repository.getAll()[0]?.id).toBe(1);
  });
  it('makes repeated registration keys idempotent', () => {
    const pokemon = { id: 25, name: 'pikachu', imageUrl: 'image' };
    repository.registerVisit(pokemon, 'strict-mode-render');
    repository.registerVisit(pokemon, 'strict-mode-render');
    expect(repository.getAll()[0]?.visits).toBe(1);
  });
  it('tracks acknowledgement by visit identity', () => {
    const pokemon = { id: 25, name: 'pikachu', imageUrl: 'image' };
    repository.registerVisit(pokemon, 'open-1');
    expect(repository.shouldShowLatestVisit()).toBe(true);
    repository.acknowledgeLatestVisit();
    expect(repository.shouldShowLatestVisit()).toBe(false);
    expect(new LocalStoragePokemonHistoryRepository(localStorage).shouldShowLatestVisit()).toBe(
      false,
    );
    repository.registerVisit(pokemon, 'open-2');
    expect(repository.shouldShowLatestVisit()).toBe(true);
  });
  it('recovers from corrupted storage', () => {
    localStorage.setItem('acity-pokedex.history.v1', '{oops');
    expect(repository.getAll()).toEqual([]);
  });
});
