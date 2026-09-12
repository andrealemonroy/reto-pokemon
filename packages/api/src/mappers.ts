import type { NamedApiResource, PokemonApiResponse, PokemonDetail, PokemonSummary } from './types';

const STAT_LABELS: Readonly<Record<string, string>> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Ataque especial',
  'special-defense': 'Defensa especial',
  speed: 'Velocidad',
};

export function pokemonIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  if (!match?.[1]) throw new Error(`URL de Pokémon inválida: ${url}`);
  return Number(match[1]);
}

export function pokemonArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
}

export function mapPokemonResource(resource: NamedApiResource, type?: string): PokemonSummary {
  const id = pokemonIdFromUrl(resource.url);
  return { id, name: resource.name, imageUrl: pokemonArtworkUrl(id), type };
}

export function mapPokemonDetail(response: PokemonApiResponse): PokemonDetail {
  const dreamWorld = response.sprites.other?.dream_world?.front_default;
  const artwork = response.sprites.other?.['official-artwork']?.front_default;
  const types = [...response.types].sort((a, b) => a.slot - b.slot).map(({ type }) => type.name);
  return {
    id: response.id,
    name: response.name,
    imageUrl:
      dreamWorld ?? artwork ?? response.sprites.front_default ?? pokemonArtworkUrl(response.id),
    imageFallbackUrl: artwork ?? response.sprites.front_default,
    type: types[0],
    types,
    stats: response.stats.map(({ stat, base_stat }) => ({
      key: stat.name,
      label: STAT_LABELS[stat.name] ?? stat.name,
      value: base_stat,
    })),
    heightMeters: response.height / 10,
    weightKilograms: response.weight / 10,
    baseExperience: response.base_experience,
    abilities: response.abilities.map(({ ability }) => ability.name.replaceAll('-', ' ')),
  };
}
