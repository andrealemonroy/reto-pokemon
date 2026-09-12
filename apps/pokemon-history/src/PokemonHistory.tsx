import type { PokemonHistoryRemoteProps } from '@pokedex/contracts';
import { historyRepository, type PokemonHistoryEntry } from '@pokedex/domain';
import { Button, EmptyState, PokemonImage } from '@pokedex/ui';
import { useSyncExternalStore } from 'react';
import './history.css';

let cachedEntries: readonly PokemonHistoryEntry[] = [];
let cachedSignature = '';
function snapshot(): readonly PokemonHistoryEntry[] {
  const next = historyRepository?.getAll() ?? [];
  const signature = JSON.stringify(next);
  if (signature !== cachedSignature) { cachedSignature = signature; cachedEntries = next; }
  return cachedEntries;
}

export default function PokemonHistory({ onPokemonSelect, onGoHome }: PokemonHistoryRemoteProps) {
  const entries = useSyncExternalStore((listener) => historyRepository?.subscribe(listener) ?? (() => undefined), snapshot, () => []);
  if (entries.length === 0) return <EmptyState title="Todavía no visitaste ningún Pokémon" description="Explora el atlas y abre una ficha para empezar a construir tu historial." action={<Button onClick={onGoHome}>Explorar Pokédex</Button>}/>;
  const totalVisits = entries.reduce((sum, entry) => sum + entry.visits, 0);
  return <main className="history-page">
    <header className="history-heading"><div><p className="eyebrow">Tu recorrido</p><h1>Historial de exploración</h1><p>Una bitácora local de cada especie que investigaste.</p></div><div className="history-summary"><strong>{entries.length}</strong><span>especies</span><strong>{totalVisits}</strong><span>visitas</span></div></header>
    <ol className="history-list">{entries.map((entry, index) => <li key={entry.id}><button className="history-row" onClick={() => onPokemonSelect(entry.id)} aria-label={`Abrir ${entry.name}, ${entry.visits} visitas`}><span className="history-rank">{String(index + 1).padStart(2, '0')}</span><PokemonImage src={entry.imageUrl} name={entry.name} className="history-image"/><span className="history-name"><strong>{entry.name}</strong><small>#{String(entry.id).padStart(4, '0')}</small></span><span className="history-date">Última visita<time dateTime={entry.lastVisitedAt}>{new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.lastVisitedAt))}</time></span><span className="history-visits"><strong>{entry.visits}</strong><small>{entry.visits === 1 ? 'visita' : 'visitas'}</small></span><span aria-hidden="true">→</span></button></li>)}</ol>
  </main>;
}
