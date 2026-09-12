import { pokemonTypeQuery } from '@pokedex/api/queries';
import type { PokemonSummary } from '@pokedex/api/types';
import { PokemonCard, TypeIcon } from '@pokedex/ui/pokemon';
import { Skeleton } from '@pokedex/ui/primitives';
import { defaultPokemonTypeMeta, pokemonTypeMeta } from '@pokedex/ui/type-meta';
import { useQueries } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

const HOME_TYPES = ['fire', 'water', 'grass', 'electric', 'psychic', 'dragon'] as const;

export function HomePage() {
  const navigate = useNavigate();
  const queries = useQueries({ queries: HOME_TYPES.map((type) => pokemonTypeQuery(type)) });
  return (
    <main className="home-page">
      <header className="home-hero">
        <div>
          <p>Pokédex nacional</p>
          <h1>Explora Pokémon por tipo</h1>
        </div>
        <p>Selecciona una categoría o abre una ficha para consultar sus datos.</p>
      </header>
      <nav className="type-shortcuts" aria-label="Tipos de Pokémon">
        {HOME_TYPES.map((type) => {
          const meta = pokemonTypeMeta[type] ?? defaultPokemonTypeMeta;
          return (
            <a
              key={type}
              href={`#category-${type}`}
              style={{ '--type-color': meta.color } as CSSProperties}
            >
              <TypeIcon type={type} />
              {meta.label}
            </a>
          );
        })}
      </nav>
      <div className="category-list">
        {HOME_TYPES.map((type, index) => (
          <CategorySection
            key={type}
            index={index + 1}
            type={type}
            query={queries[index]!}
            onSelect={(id) => navigate(`/pokemon/${id}`)}
          />
        ))}
      </div>
    </main>
  );
}

function CategorySection({
  type,
  index,
  query,
  onSelect,
}: {
  readonly type: string;
  readonly index: number;
  readonly query: {
    readonly data?: readonly PokemonSummary[];
    readonly isPending: boolean;
    readonly isError: boolean;
    readonly refetch: () => unknown;
  };
  readonly onSelect: (id: number) => void;
}) {
  const meta = pokemonTypeMeta[type] ?? { ...defaultPokemonTypeMeta, label: type };
  return (
    <section className="category-section" aria-labelledby={`category-${type}`}>
      <header>
        <span className="category-icon" style={{ '--type-color': meta.color } as CSSProperties}>
          <TypeIcon type={type} size={22} />
        </span>
        <div>
          <p>Tipo {String(index).padStart(2, '0')}</p>
          <h2 id={`category-${type}`}>{meta.label}</h2>
        </div>
        <p>10 especies</p>
      </header>
      {query.isPending && (
        <div className="pokemon-grid" aria-label={`Cargando Pokémon de tipo ${meta.label}`}>
          {Array.from({ length: 5 }, (_, key) => (
            <Skeleton key={key} className="card-skeleton" />
          ))}
        </div>
      )}
      {query.isError && (
        <div className="inline-error" role="alert">
          <p>No pudimos cargar esta categoría.</p>
          <button onClick={() => void query.refetch()}>Reintentar</button>
        </div>
      )}
      {query.data && (
        <div className="pokemon-grid">
          {query.data.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}
