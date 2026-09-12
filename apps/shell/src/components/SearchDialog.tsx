import { ApiError } from '@pokedex/api/client';
import { pokemonDetailQuery, pokemonListInfiniteQuery } from '@pokedex/api/queries';
import { normalizePokemonSearch } from '@pokedex/domain/search';
import { PokemonCard } from '@pokedex/ui/pokemon';
import { Button, ErrorState, Skeleton, Spinner } from '@pokedex/ui/primitives';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

export function SearchDialog({
  onClose,
  onSelect,
}: {
  readonly onClose: () => void;
  readonly onSelect: (id: number) => void;
}) {
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef(document.activeElement as HTMLElement | null);
  const listQuery = useInfiniteQuery(pokemonListInfiniteQuery());
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = listQuery;
  const exactQuery = useQuery({ ...pokemonDetailQuery(search), enabled: Boolean(search) });
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const focusTarget = returnFocus.current;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      focusTarget?.focus();
    };
  }, []);
  useEffect(() => {
    if (search || !sentinel.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) void fetchNextPage();
      },
      { root: dialogRef.current, rootMargin: '240px' },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, search]);
  const trapFocus = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [href], select:not([disabled])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSearch(normalizePokemonSearch(input));
  };
  const clear = () => {
    setInput('');
    setSearch('');
    inputRef.current?.focus();
  };
  const notFound = exactQuery.error instanceof ApiError && exactQuery.error.status === 404;
  return createPortal(
    <div
      className="search-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
        ref={dialogRef}
        onKeyDown={trapFocus}
      >
        <header className="search-header">
          <div>
            <p className="eyebrow">Buscador</p>
            <h2 id="search-title">Buscar Pokémon</h2>
          </div>
          <button className="dialog-close" onClick={onClose} aria-label="Cerrar buscador">
            ×
          </button>
        </header>
        <form className="search-form" onSubmit={submit} role="search">
          <span aria-hidden="true">⌕</span>
          <label className="sr-only" htmlFor="pokemon-search">
            Nombre exacto del Pokémon
          </label>
          <input
            id="pokemon-search"
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Escribe un nombre exacto…"
            autoComplete="off"
          />
          <Button type="submit">Buscar</Button>
          {input && (
            <button type="button" className="clear-search" onClick={clear}>
              Limpiar
            </button>
          )}
        </form>
        <div className="search-meta">
          <p>
            {search ? (
              <>
                Resultado exacto para <strong>“{search}”</strong>
              </>
            ) : (
              'Explora el listado completo · 30 por página'
            )}
          </p>
          {!search && (
            <span>{listQuery.data?.pages.flatMap((page) => page.items).length ?? 0} cargados</span>
          )}
        </div>
        <div className="search-content">
          {search && exactQuery.isPending && <SearchSkeleton />}
          {search && notFound && (
            <ErrorState
              title="No encontrado"
              description={`No existe un Pokémon con el nombre exacto “${search}”. Revisa la escritura o vuelve al listado.`}
              onBack={clear}
            />
          )}
          {search && exactQuery.isError && !notFound && (
            <ErrorState
              title="No pudimos buscar"
              description="Hay un problema de red o del servicio. Tu búsqueda sigue aquí."
              onRetry={() => void exactQuery.refetch()}
            />
          )}
          {search && exactQuery.data && (
            <div className="search-exact">
              <PokemonCard pokemon={exactQuery.data} onSelect={onSelect} />
            </div>
          )}
          {!search && listQuery.isPending && <SearchSkeleton />}
          {!search && listQuery.isError && (
            <ErrorState
              title="No pudimos cargar el listado"
              description="Comprueba tu conexión e inténtalo de nuevo."
              onRetry={() => void listQuery.refetch()}
            />
          )}
          {!search && listQuery.data && (
            <div className="search-grid">
              {listQuery.data.pages
                .flatMap((page) => page.items)
                .map((pokemon) => (
                  <PokemonCard key={pokemon.id} pokemon={pokemon} onSelect={onSelect} />
                ))}
            </div>
          )}
          {!search && (
            <div className="scroll-sentinel" ref={sentinel}>
              {listQuery.isFetchingNextPage ? (
                <>
                  <Spinner /> Cargando más Pokémon…
                </>
              ) : !listQuery.hasNextPage && listQuery.data ? (
                'Llegaste al final del listado.'
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SearchSkeleton() {
  return (
    <div className="search-grid" aria-label="Cargando resultados">
      {Array.from({ length: 8 }, (_, key) => (
        <Skeleton key={key} className="card-skeleton" />
      ))}
    </div>
  );
}
