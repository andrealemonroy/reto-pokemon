import {
  ArrowUpRight,
  Biohazard,
  Brain,
  Bug,
  Circle,
  Droplets,
  Dumbbell,
  Flame,
  Gem,
  Ghost,
  Leaf,
  Moon,
  Mountain,
  Orbit,
  Shield,
  Snowflake,
  Sparkles,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { defaultPokemonTypeMeta, pokemonTypeMeta } from './type-meta';

const typeIcons: Readonly<Record<string, LucideIcon>> = {
  normal: Circle,
  fire: Flame,
  water: Droplets,
  electric: Zap,
  grass: Leaf,
  ice: Snowflake,
  fighting: Dumbbell,
  poison: Biohazard,
  ground: Mountain,
  flying: Wind,
  psychic: Brain,
  bug: Bug,
  rock: Gem,
  ghost: Ghost,
  dragon: Orbit,
  dark: Moon,
  steel: Shield,
  fairy: Sparkles,
};

export interface PokemonCardData {
  readonly id: number;
  readonly name: string;
  readonly imageUrl: string;
  readonly type?: string;
}

export function PokemonImage({
  src,
  fallbackSrc,
  name,
  className = '',
}: {
  readonly src: string;
  readonly fallbackSrc?: string | null;
  readonly name: string;
  readonly className?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span
      className={`image-fallback ${className}`}
      aria-label={`Imagen no disponible para ${name}`}
    >
      #{name.charAt(0).toUpperCase()}
    </span>
  ) : (
    <img
      className={className}
      src={currentSrc}
      alt={name}
      loading="lazy"
      onError={() =>
        fallbackSrc && currentSrc !== fallbackSrc ? setCurrentSrc(fallbackSrc) : setFailed(true)
      }
    />
  );
}

export function TypeBadge({ type }: { readonly type: string }) {
  const meta = pokemonTypeMeta[type] ?? { ...defaultPokemonTypeMeta, label: type };
  return (
    <span
      className={`type-badge type-badge--${type}`}
      style={{ '--type-color': meta.color } as CSSProperties}
    >
      <TypeIcon type={type} size={14} />
      {meta.label}
    </span>
  );
}

export function TypeIcon({
  type,
  size = 18,
  className = '',
}: {
  readonly type: string;
  readonly size?: number;
  readonly className?: string;
}) {
  const Icon = typeIcons[type] ?? Circle;
  return <Icon className={className} size={size} strokeWidth={2.4} aria-hidden="true" />;
}

export function PokemonCard({
  pokemon,
  onSelect,
}: {
  readonly pokemon: PokemonCardData;
  readonly onSelect: (id: number) => void;
}) {
  const meta = pokemonTypeMeta[pokemon.type ?? 'normal'] ?? defaultPokemonTypeMeta;
  return (
    <button
      className="pokemon-card"
      style={{ '--type-color': meta.color } as CSSProperties}
      onClick={() => onSelect(pokemon.id)}
      aria-label={`Ver detalle de ${pokemon.name}`}
    >
      <span className="pokemon-card__art">
        <TypeIcon type={pokemon.type ?? 'normal'} size={140} className="pokemon-card__watermark" />
        <PokemonImage src={pokemon.imageUrl} name={pokemon.name} />
      </span>
      <span className="pokemon-card__body">
        <span className="pokemon-card__number">Nº{String(pokemon.id).padStart(4, '0')}</span>
        <span className="pokemon-card__name">{pokemon.name}</span>
        {pokemon.type ? <TypeBadge type={pokemon.type} /> : null}
        <ArrowUpRight className="pokemon-card__arrow" size={20} aria-hidden="true" />
      </span>
    </button>
  );
}
