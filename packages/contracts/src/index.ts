export interface PokemonDetailRemoteProps {
  readonly pokemonId: number;
  readonly visitKey: string;
  readonly onBack: () => void;
}

export interface PokemonHistoryRemoteProps {
  readonly onPokemonSelect: (pokemonId: number) => void;
  readonly onGoHome: () => void;
}
