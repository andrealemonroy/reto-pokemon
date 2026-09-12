import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { apiGet } from './client';
import { mapPokemonDetail, mapPokemonResource } from './mappers';
import type { PokemonApiResponse, PokemonListResponse, PokemonTypeResponse } from './types';

export const pokemonKeys = {
  all: ['pokemon'] as const,
  detail: (idOrName: string | number) => [...pokemonKeys.all, 'detail', idOrName] as const,
  type: (type: string) => [...pokemonKeys.all, 'type', type] as const,
  list: (limit: number) => [...pokemonKeys.all, 'list', limit] as const,
};

export const pokemonDetailQuery = (idOrName: string | number) =>
  queryOptions({
    queryKey: pokemonKeys.detail(idOrName),
    queryFn: async ({ signal }) =>
      mapPokemonDetail(await apiGet<PokemonApiResponse>(`/pokemon/${idOrName}`, signal)),
    staleTime: 10 * 60 * 1000,
    retry: (count, error) =>
      !(error instanceof Error && 'status' in error && error.status === 404) && count < 2,
  });

export const pokemonTypeQuery = (type: string) =>
  queryOptions({
    queryKey: pokemonKeys.type(type),
    queryFn: async ({ signal }) => {
      const data = await apiGet<PokemonTypeResponse>(`/type/${type}`, signal);
      return data.pokemon.slice(0, 10).map(({ pokemon }) => mapPokemonResource(pokemon, type));
    },
    staleTime: 30 * 60 * 1000,
  });

export const pokemonListInfiniteQuery = () =>
  infiniteQueryOptions({
    queryKey: pokemonKeys.list(30),
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      const data = await apiGet<PokemonListResponse>(
        `/pokemon?limit=30&offset=${pageParam}`,
        signal,
      );
      return {
        items: data.results.map((resource) => mapPokemonResource(resource)),
        nextOffset: data.next ? pageParam + 30 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 10 * 60 * 1000,
  });
