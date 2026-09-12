import { pokemonTypeQuery, type PokemonSummary } from '@pokedex/api';
import { PokemonCard, Skeleton, pokemonTypeMeta } from '@pokedex/ui';
import { useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const HOME_TYPES = ['fire', 'water', 'grass', 'electric', 'psychic', 'dragon'] as const;

export function HomePage() {
  const navigate = useNavigate();
  const queries = useQueries({ queries: HOME_TYPES.map((type) => pokemonTypeQuery(type)) });
  const loaded = queries.filter((query) => query.isSuccess).length;
  return <main className="home-page">
    <section className="home-hero"><div><p className="eyebrow">Atlas de especies</p><h1>Explora el mundo<br/>Pokémon <em>por tipo.</em></h1><p>Seis colecciones seleccionadas para descubrir habilidades, estadísticas y nuevas especies sin perder tu recorrido.</p></div><aside aria-label="Progreso de carga"><strong>{loaded || '—'}</strong><span>de {HOME_TYPES.length}<br/>categorías listas</span></aside></section>
    <div className="category-list">{HOME_TYPES.map((type, index) => <CategorySection key={type} index={index + 1} type={type} query={queries[index]!} onSelect={(id) => navigate(`/pokemon/${id}`)}/>)}</div>
  </main>;
}

function CategorySection({ type, index, query, onSelect }: { readonly type: string; readonly index: number; readonly query: { readonly data?: readonly PokemonSummary[]; readonly isPending: boolean; readonly isError: boolean; readonly refetch: () => unknown }; readonly onSelect: (id: number) => void }) {
  const meta = pokemonTypeMeta[type] ?? { label: type, color: '#64748b' };
  return <section className="category-section" aria-labelledby={`category-${type}`}><header><span>{String(index).padStart(2, '0')}</span><div><p style={{ color: meta.color }}>TIPO</p><h2 id={`category-${type}`}>{meta.label}</h2></div><p>10 especies</p></header>
    {query.isPending && <div className="pokemon-grid" aria-label={`Cargando Pokémon de tipo ${meta.label}`}>{Array.from({ length: 5 }, (_, key) => <Skeleton key={key} className="card-skeleton"/>)}</div>}
    {query.isError && <div className="inline-error" role="alert"><p>No pudimos cargar esta categoría.</p><button onClick={() => void query.refetch()}>Reintentar</button></div>}
    {query.data && <div className="pokemon-grid">{query.data.map((pokemon) => <PokemonCard key={pokemon.id} pokemon={pokemon} onSelect={onSelect}/>)}</div>}
  </section>;
}
