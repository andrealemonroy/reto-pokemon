export const pokemonTypeMeta: Readonly<
  Record<string, { readonly label: string; readonly color: string }>
> = {
  normal: { label: 'Normal', color: '#9aa4ad' },
  fire: { label: 'Fuego', color: '#ff9854' },
  water: { label: 'Agua', color: '#5594d6' },
  electric: { label: 'Eléctrico', color: '#f7d33d' },
  grass: { label: 'Planta', color: '#62ba57' },
  ice: { label: 'Hielo', color: '#71c9bf' },
  fighting: { label: 'Lucha', color: '#cf3f6c' },
  poison: { label: 'Veneno', color: '#b05cc9' },
  ground: { label: 'Tierra', color: '#dc7842' },
  flying: { label: 'Volador', color: '#85a9df' },
  psychic: { label: 'Psíquico', color: '#fa6d78' },
  bug: { label: 'Bicho', color: '#8bc52a' },
  rock: { label: 'Roca', color: '#c8ba8d' },
  ghost: { label: 'Fantasma', color: '#586fb3' },
  dragon: { label: 'Dragón', color: '#1679bd' },
  dark: { label: 'Siniestro', color: '#5d5968' },
  steel: { label: 'Acero', color: '#5f96a8' },
  fairy: { label: 'Hada', color: '#e483dc' },
};

export const defaultPokemonTypeMeta = { label: 'Normal', color: '#9aa4ad' } as const;
