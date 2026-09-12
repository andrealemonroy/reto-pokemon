export interface VisitedPokemon {
  readonly id: number;
  readonly name: string;
  readonly imageUrl: string;
}
export interface PokemonHistoryEntry extends VisitedPokemon {
  readonly visits: number;
  readonly lastVisitedAt: string;
}
export interface PokemonVisit {
  readonly visitId: string;
  readonly pokemonId: number;
  readonly pokemonName: string;
  readonly visitedAt: string;
}
interface HistoryDocument {
  readonly version: 1;
  readonly entries: readonly PokemonHistoryEntry[];
  readonly latestVisit: PokemonVisit | null;
  readonly acknowledgedVisitId: string | null;
  readonly lastRegistrationKey: string | null;
}
export interface PokemonHistoryRepository {
  getAll(): readonly PokemonHistoryEntry[];
  getLatestVisit(): PokemonVisit | null;
  registerVisit(pokemon: VisitedPokemon, registrationKey: string): PokemonVisit;
  shouldShowLatestVisit(): boolean;
  acknowledgeLatestVisit(): void;
  subscribe(listener: () => void): () => void;
}

const STORAGE_KEY = 'acity-pokedex.history.v1';
const CHANGE_EVENT = 'acity-pokedex:history-change';
const EMPTY: HistoryDocument = {
  version: 1,
  entries: [],
  latestVisit: null,
  acknowledgedVisitId: null,
  lastRegistrationKey: null,
};

function isEntry(value: unknown): value is PokemonHistoryEntry {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'id' in value &&
    typeof value.id === 'number' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'imageUrl' in value &&
    typeof value.imageUrl === 'string' &&
    'visits' in value &&
    typeof value.visits === 'number' &&
    value.visits > 0 &&
    'lastVisitedAt' in value &&
    typeof value.lastVisitedAt === 'string',
  );
}

function isVisit(value: unknown): value is PokemonVisit {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'visitId' in value &&
    typeof value.visitId === 'string' &&
    'pokemonId' in value &&
    typeof value.pokemonId === 'number' &&
    'pokemonName' in value &&
    typeof value.pokemonName === 'string' &&
    'visitedAt' in value &&
    typeof value.visitedAt === 'string',
  );
}

function readDocument(storage: Storage): HistoryDocument {
  try {
    const value: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null');
    if (
      !value ||
      typeof value !== 'object' ||
      !('version' in value) ||
      value.version !== 1 ||
      !('entries' in value) ||
      !Array.isArray(value.entries) ||
      !value.entries.every(isEntry)
    )
      return EMPTY;
    const record = value as Record<string, unknown>;
    const entries = (record.entries as PokemonHistoryEntry[])
      .filter((entry, index, all) => all.findIndex(({ id }) => id === entry.id) === index)
      .sort((a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt));
    return {
      version: 1,
      entries,
      latestVisit: isVisit(record.latestVisit) ? record.latestVisit : null,
      acknowledgedVisitId:
        typeof record.acknowledgedVisitId === 'string' ? record.acknowledgedVisitId : null,
      lastRegistrationKey:
        typeof record.lastRegistrationKey === 'string' ? record.lastRegistrationKey : null,
    };
  } catch {
    return EMPTY;
  }
}

export class LocalStoragePokemonHistoryRepository implements PokemonHistoryRepository {
  constructor(
    private readonly storage: Storage,
    private readonly now: () => Date = () => new Date(),
    private readonly createId: () => string = () => crypto.randomUUID(),
  ) {}
  private read() {
    return readDocument(this.storage);
  }
  private write(document: HistoryDocument) {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(document));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
  getAll() {
    return this.read().entries;
  }
  getLatestVisit() {
    return this.read().latestVisit;
  }
  registerVisit(pokemon: VisitedPokemon, registrationKey: string): PokemonVisit {
    const document = this.read();
    if (document.lastRegistrationKey === registrationKey && document.latestVisit)
      return document.latestVisit;
    const visitedAt = this.now().toISOString();
    const visit = {
      visitId: this.createId(),
      pokemonId: pokemon.id,
      pokemonName: pokemon.name,
      visitedAt,
    };
    const previous = document.entries.find((entry) => entry.id === pokemon.id);
    const updated = { ...pokemon, visits: (previous?.visits ?? 0) + 1, lastVisitedAt: visitedAt };
    const entries = [updated, ...document.entries.filter((entry) => entry.id !== pokemon.id)];
    this.write({ ...document, entries, latestVisit: visit, lastRegistrationKey: registrationKey });
    return visit;
  }
  shouldShowLatestVisit() {
    const document = this.read();
    return Boolean(
      document.latestVisit && document.latestVisit.visitId !== document.acknowledgedVisitId,
    );
  }
  acknowledgeLatestVisit() {
    const document = this.read();
    if (document.latestVisit)
      this.write({ ...document, acknowledgedVisitId: document.latestVisit.visitId });
  }
  subscribe(listener: () => void) {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) listener();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener(CHANGE_EVENT, listener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CHANGE_EVENT, listener);
    };
  }
}

export const historyRepository =
  typeof localStorage === 'undefined'
    ? null
    : new LocalStoragePokemonHistoryRepository(localStorage);
export const historyStorageKey = STORAGE_KEY;
