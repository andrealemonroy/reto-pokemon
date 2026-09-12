import { useQuery } from '@tanstack/react-query';
import { pokemonDetailQuery } from '@pokedex/api/queries';
import type { PokemonDetailRemoteProps } from '@pokedex/contracts';
import { historyRepository } from '@pokedex/domain/history';
import { PokemonImage, TypeBadge, TypeIcon } from '@pokedex/ui/pokemon';
import { Button, ErrorState, Skeleton } from '@pokedex/ui/primitives';
import { defaultPokemonTypeMeta, pokemonTypeMeta } from '@pokedex/ui/type-meta';
import { ArrowLeft, Gauge, Ruler, Weight } from 'lucide-react';
import { useEffect, useRef, type CSSProperties } from 'react';
import './detail.css';

const STAT_DISPLAY_MAX = 180;

export default function PokemonDetail({ pokemonId, visitKey, onBack }: PokemonDetailRemoteProps) {
  const query = useQuery(pokemonDetailQuery(pokemonId));
  const registeredKey = useRef<string | null>(null);
  useEffect(() => {
    if (!query.data || registeredKey.current === visitKey) return;
    historyRepository?.registerVisit(
      { id: query.data.id, name: query.data.name, imageUrl: query.data.imageUrl },
      visitKey,
    );
    registeredKey.current = visitKey;
  }, [query.data, visitKey]);

  if (query.isPending) return <DetailSkeleton />;
  if (query.isError)
    return (
      <ErrorState
        description="El detalle no está disponible en este momento. Revisa tu conexión e inténtalo otra vez."
        onRetry={() => void query.refetch()}
        onBack={onBack}
      />
    );
  const pokemon = query.data;
  const primaryType = pokemon.types[0] ?? 'normal';
  const primaryTypeMeta = pokemonTypeMeta[primaryType] ?? defaultPokemonTypeMeta;
  return (
    <main
      className="detail-page"
      style={{ '--pokemon-color': primaryTypeMeta.color } as CSSProperties}
    >
      <button className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} aria-hidden="true" />
        Volver a explorar
      </button>
      <article className="detail-hero">
        <div className="detail-visual" aria-hidden="true">
          <TypeIcon type={primaryType} size={320} className="detail-watermark" />
          <PokemonImage
            src={pokemon.imageUrl}
            fallbackSrc={pokemon.imageFallbackUrl}
            name={pokemon.name}
            className="detail-image"
          />
          <span className="detail-id">#{String(pokemon.id).padStart(4, '0')}</span>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">#{String(pokemon.id).padStart(4, '0')}</p>
          <h1>{pokemon.name}</h1>
          <div className="detail-types">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
          <p className="detail-intro">Información básica y estadísticas del Pokémon.</p>
          <dl className="metrics">
            <div>
              <dt>
                <Ruler size={15} aria-hidden="true" /> Altura
              </dt>
              <dd>{pokemon.heightMeters} m</dd>
            </div>
            <div>
              <dt>
                <Weight size={15} aria-hidden="true" /> Peso
              </dt>
              <dd>{pokemon.weightKilograms} kg</dd>
            </div>
            <div>
              <dt>
                <Gauge size={15} aria-hidden="true" /> Experiencia
              </dt>
              <dd>{pokemon.baseExperience ?? '—'}</dd>
            </div>
          </dl>
        </div>
      </article>
      <section className="detail-grid">
        <div className="detail-panel">
          <p className="eyebrow">Rendimiento</p>
          <h2>Estadísticas base</h2>
          <div className="stats-list">
            {pokemon.stats.map((stat) => (
              <div className="stat" key={stat.key}>
                <div className="stat__label">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
                <div
                  className="stat__track"
                  role="progressbar"
                  aria-label={stat.label}
                  aria-valuemin={0}
                  aria-valuemax={STAT_DISPLAY_MAX}
                  aria-valuenow={Math.min(stat.value, STAT_DISPLAY_MAX)}
                >
                  <span
                    style={{ width: `${Math.min((stat.value / STAT_DISPLAY_MAX) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="stat-note">
            Escala visual relativa de 0 a {STAT_DISPLAY_MAX}; el valor numérico conserva el stat
            real.
          </p>
        </div>
        <div className="detail-panel">
          <p className="eyebrow">Capacidades</p>
          <h2>Habilidades</h2>
          <ul className="ability-list">
            {pokemon.abilities.map((ability, index) => (
              <li key={ability}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {ability}
              </li>
            ))}
          </ul>
          <Button variant="secondary" onClick={onBack}>
            Descubrir otro Pokémon
          </Button>
        </div>
      </section>
    </main>
  );
}

function DetailSkeleton() {
  return (
    <main className="detail-page" aria-label="Cargando detalle">
      <Skeleton className="detail-back-skeleton" />
      <div className="detail-hero">
        <Skeleton className="detail-visual" />
        <div className="detail-copy">
          <Skeleton className="skeleton--title" />
          <Skeleton />
          <Skeleton />
          <Skeleton className="skeleton--hero" />
        </div>
      </div>
    </main>
  );
}
