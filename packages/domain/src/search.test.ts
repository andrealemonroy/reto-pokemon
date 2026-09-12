import { describe, expect, it } from 'vitest';
import { normalizePokemonSearch } from './search';

describe('normalizePokemonSearch', () => {
  it.each([[' Pikachu ', 'pikachu'], ['PÍKACHU', 'pikachu'], ['Mr Mime', 'mrmime']])('normalizes %s', (input, expected) => {
    expect(normalizePokemonSearch(input)).toBe(expected);
  });
});
