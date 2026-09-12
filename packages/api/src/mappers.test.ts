import { describe, expect, it } from 'vitest';
import { mapPokemonDetail, mapPokemonResource, pokemonIdFromUrl } from './mappers';
import type { PokemonApiResponse } from './types';

describe('pokemon mappers', () => {
  it('extracts an id and builds a summary without detail requests', () => {
    expect(pokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
    expect(mapPokemonResource({ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }, 'electric')).toMatchObject({ id: 25, name: 'pikachu', type: 'electric' });
  });
  it('prefers SVG artwork and maps API names to a focused domain model', () => {
    const response: PokemonApiResponse = {
      id: 25, name: 'pikachu', height: 4, weight: 60, base_experience: 112,
      types: [{ slot: 1, type: { name: 'electric', url: '' } }],
      abilities: [{ ability: { name: 'static', url: '' }, is_hidden: false }],
      stats: [{ base_stat: 35, stat: { name: 'hp', url: '' } }],
      sprites: { front_default: 'sprite.png', other: { dream_world: { front_default: 'art.svg' }, 'official-artwork': { front_default: 'art.png' } } },
    };
    expect(mapPokemonDetail(response)).toMatchObject({ imageUrl: 'art.svg', imageFallbackUrl: 'art.png', heightMeters: .4, weightKilograms: 6, stats: [{ label: 'HP', value: 35 }] });
  });
});
