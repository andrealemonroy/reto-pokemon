import { useState } from 'react';
import { pokemonTypeMeta } from './type-meta';

export interface PokemonCardData { readonly id: number; readonly name: string; readonly imageUrl: string; readonly type?: string }

export function PokemonImage({ src, fallbackSrc, name, className = '' }: { readonly src: string; readonly fallbackSrc?: string | null; readonly name: string; readonly className?: string }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  return failed ? <span className={`image-fallback ${className}`} aria-label={`Imagen no disponible para ${name}`}>#{name.charAt(0).toUpperCase()}</span> :
    <img className={className} src={currentSrc} alt={name} loading="lazy" onError={() => fallbackSrc && currentSrc !== fallbackSrc ? setCurrentSrc(fallbackSrc) : setFailed(true)} />;
}

export function TypeBadge({ type }: { readonly type: string }) {
  const meta = pokemonTypeMeta[type] ?? { label: type, color: '#64748b' };
  return <span className="type-badge" style={{ '--type-color': meta.color } as React.CSSProperties}>{meta.label}</span>;
}

export function PokemonCard({ pokemon, onSelect }: { readonly pokemon: PokemonCardData; readonly onSelect: (id: number) => void }) {
  return <button className="pokemon-card" onClick={() => onSelect(pokemon.id)} aria-label={`Ver detalle de ${pokemon.name}`}>
    <span className="pokemon-card__number">#{String(pokemon.id).padStart(4, '0')}</span>
    <span className="pokemon-card__art"><PokemonImage src={pokemon.imageUrl} name={pokemon.name} /></span>
    <span className="pokemon-card__name">{pokemon.name}</span>
    {pokemon.type && <TypeBadge type={pokemon.type} />}
    <span className="pokemon-card__arrow" aria-hidden="true">↗</span>
  </button>;
}
