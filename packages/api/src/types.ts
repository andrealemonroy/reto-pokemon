export interface NamedApiResource { readonly name: string; readonly url: string }
export interface PokemonListResponse {
  readonly count: number;
  readonly next: string | null;
  readonly results: readonly NamedApiResource[];
}
export interface PokemonTypeResponse {
  readonly pokemon: readonly { readonly pokemon: NamedApiResource; readonly slot: number }[];
}
export interface PokemonApiResponse {
  readonly id: number;
  readonly name: string;
  readonly height: number;
  readonly weight: number;
  readonly base_experience: number | null;
  readonly types: readonly { readonly slot: number; readonly type: NamedApiResource }[];
  readonly abilities: readonly { readonly ability: NamedApiResource; readonly is_hidden: boolean }[];
  readonly stats: readonly { readonly base_stat: number; readonly stat: NamedApiResource }[];
  readonly sprites: {
    readonly front_default: string | null;
    readonly other?: {
      readonly dream_world?: { readonly front_default: string | null };
      readonly ['official-artwork']?: { readonly front_default: string | null };
    };
  };
}

export interface PokemonSummary {
  readonly id: number;
  readonly name: string;
  readonly imageUrl: string;
  readonly type?: string;
}

export interface PokemonDetail extends PokemonSummary {
  readonly imageFallbackUrl: string | null;
  readonly types: readonly string[];
  readonly stats: readonly { readonly key: string; readonly label: string; readonly value: number }[];
  readonly heightMeters: number;
  readonly weightKilograms: number;
  readonly baseExperience: number | null;
  readonly abilities: readonly string[];
}
