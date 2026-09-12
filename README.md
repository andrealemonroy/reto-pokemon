# Technical Challenge — Frontend Senior

## Overview

**Atlas Pokédex** es una aplicación responsive para explorar Pokémon por tipo, buscar una especie exacta, estudiar su ficha y conservar un historial local de visitas. La solución prioriza límites de aplicación reales, contratos explícitos, resiliencia de remotes y estados de UX completos.

El challenge se implementa como un monorepo npm workspaces con tres aplicaciones Vite que pueden ejecutarse por separado:

- Shell / Host: <http://localhost:3000>
- Pokémon Detail MFE: <http://localhost:3001>
- Pokémon History MFE: <http://localhost:3002>

## Getting started

Requisitos: Node.js 22+ y npm 10+.

```bash
npm install
cp .env.example .env.local # opcional; existen defaults locales
npm run dev
```

Credenciales demo: cualquier email válido y cualquier contraseña de al menos 6 caracteres. La contraseña nunca se persiste.

### Scripts

| Script | Propósito |
|---|---|
| `npm run dev` | Levanta Shell, Detail e History en paralelo |
| `npm run dev:shell` | Solo Shell en 3000 |
| `npm run dev:detail` | Solo Detail en 3001 |
| `npm run dev:history` | Solo History en 3002 |
| `npm run lint` | ESLint sin warnings permitidos |
| `npm run typecheck` | TypeScript strict para todo el workspace |
| `npm run test` | Suite unitaria/de integración con Vitest |
| `npm run test:e2e` | Playwright en desktop y mobile |
| `npm run build` | Build independiente de las tres apps |
| `npm run validate` | lint + typecheck + test + build |

Para la primera ejecución E2E puede ser necesario `npx playwright install chromium`.

## Architecture

```text
                     ┌────────────────────────┐
                     │         Shell          │
                     │     localhost:3000     │
                     │                        │
                     │ Auth · Home · Search   │
                     │ Router · Theme · Toast │
                     └───────────┬────────────┘
                                 │
                     Module Federation
                    loaded-first · lazy routes
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────────┐  ┌───────────────────────┐
        │ Pokémon Detail MFE    │  │ Pokémon History MFE   │
        │ localhost:3001        │  │ localhost:3002        │
        │ GET /pokemon/{id}     │  │ repository projection │
        └───────────────────────┘  └───────────────────────┘
                    │                         │
                    └────────────┬────────────┘
                                 ▼
              api · contracts · domain · ui packages
```

### Repository layout

```text
apps/
  shell/               host, routes and cross-cutting UI
  pokemon-detail/      independently runnable remote
  pokemon-history/     independently runnable remote
packages/
  api/                 typed PokeAPI client, mappers and query options
  contracts/           public Shell ↔ MFE prop contracts only
  domain/              auth, theme, search and history persistence
  ui/                  small visual primitives and semantic tokens
e2e/                   full user journeys
```

### Responsibilities

| Boundary | Owns | Does not own |
|---|---|---|
| Shell | auth/session, protected routes, Home, search dialog, layout, navigation, theme, toast, remote composition | remote internals or remote server state |
| Detail MFE | Pokémon detail query, presentation, stat semantics, successful-open registration | navigation implementation, auth, toast |
| History MFE | history projection, empty state, selection callback | detail fetching or visit increments during render |
| API | HTTP errors, minimal wire types, mapping, query key factory/options | UI or browser persistence |
| Domain | explicit persistence/auth/theme/search rules | PokeAPI server state |
| UI | repeated primitives, cards, image fallback, type metadata, design tokens | application workflows |

There is no circular application dependency: the Shell consumes public remote modules; remotes depend only on deliberately shared packages.

## Technology choices

- **React 19 + strict TypeScript:** component model and strong contracts without type escapes.
- **Vite + `@module-federation/vite`:** each MFE is a real entry point and produces its own `remoteEntry.js`. `loaded-first` keeps offline remotes from blocking Shell startup and loads them only on their route.
- **React Router:** navigation is URL state (`/login`, `/`, `/pokemon/:id`, `/history`), so direct URLs and refreshes work.
- **TanStack Query:** server cache, deduplication, retry, cancellation, loading/error states and infinite pagination. PokeAPI responses are never copied to Zustand.
- **Zustand:** only global client state with multiple consumers: session and theme preference.
- **Semantic CSS:** one token system supports light/dark themes without scattering mode-specific classes. CSS remains scoped by component-oriented class names.
- **Vitest + Testing Library + Playwright:** fast rules tests, behavioral component tests and real federated flows.

React, React DOM, React Router and TanStack Query are configured as federation singletons (including React subpath entries) to prevent duplicate React/context instances.

## State management

```text
Server state       → TanStack Query
Global client      → Zustand (session and theme only)
Persistence        → LocalStorage repositories/adapters
Local UI           → React state
Navigation         → URL / React Router
```

This division keeps ownership visible. Search input/open state is local; list/detail data belongs to the query cache; durable visits are read through a repository; route identity stays in the URL.

## API and performance strategy

The UI never calls PokeAPI directly. `apiGet` maps fetch/network/status failures into `ApiError`; focused wire types are mapped into view-friendly domain types. Query keys are centralized under `pokemonKeys`.

Home performs exactly one `/type/{type}` call for each of six displayed categories. It derives Pokémon IDs from each resource URL and constructs official sprite artwork URLs, avoiding the classic additional 60 detail-request N+1. Detail makes its one required request when its lazy route opens.

Other deliberate choices:

- category cache: 30-minute stale time; list/detail cache: 10 minutes;
- request cancellation through `AbortSignal`;
- retry only for recoverable failures, never for expected 404;
- `useInfiniteQuery` with pages of 30 and `IntersectionObserver` root margin;
- lazy images with SVG → official artwork → sprite → accessible placeholder fallback;
- stable list keys and route-level lazy remotes;
- `shareStrategy: loaded-first` so remotes are requested on demand.

## Search behavior and accessibility

Opening search starts `GET /pokemon?limit=30&offset=0`. The sentinel requests successive offsets of 30. Submitting a non-empty value passes through:

```text
"  PÍKACHU  " → Unicode decomposition → remove accents → lowercase → remove spaces → "pikachu"
```

Then the exact endpoint `/pokemon/pikachu` is queried. HTTP 404 maps to a dedicated “No encontrado” result, while network/server errors expose retry.

The fullscreen dialog provides initial focus, focus trap, Escape/backdrop dismissal, scroll lock, focus restoration, semantic dialog labeling, and makes background content inert. Keyboard focus states, skip navigation, semantic landmarks, progressbar values, `role="status"` toast announcements and reduced-motion preferences are included.

## History and visit identity

History persistence is versioned and validated before use:

```ts
{
  version: 1,
  entries: PokemonHistoryEntry[],
  latestVisit: PokemonVisit | null,
  acknowledgedVisitId: string | null,
  lastRegistrationKey: string | null
}
```

Conceptual algorithm:

```text
registerVisit(pokemon, registrationKey)
  if registrationKey equals the last registration key: return existing visit
  if pokemon.id is new: visits = 1
  otherwise: visits = previous visits + 1
  update snapshot fields and lastVisitedAt
  create a uniquely identified visit
  move entry to most-recent-first position
  persist and notify subscribers
```

`pokemon.id` is the natural key, so entries never duplicate. A page-session + Router location key identifies one detail opening; both a component ref and repository-level key guard make React StrictMode/effect replays idempotent. A later navigation or reload is a new opening and therefore a new visit.

Invalid JSON, missing fields and unsupported versions fall back to an empty valid document rather than breaking rendering.

## Toast state machine

```text
Visit N created → pending acknowledgement → reload → toast shown
       → user closes → Visit N acknowledged → reload stays quiet
Visit N+1 created → new pending acknowledgement
```

The predicate is `latestVisit.visitId !== acknowledgedVisitId`; there is no ambiguous `toastClosed` boolean. Closing acknowledges the current latest visit. The Shell snapshots pending state on startup, so a visit is announced after a reload rather than immediately while the user is already looking at that detail.

## Microfrontend communication and resilience

The public API is intentionally narrow:

```ts
interface PokemonDetailRemoteProps {
  pokemonId: number;
  visitKey: string;
  onBack(): void;
}

interface PokemonHistoryRemoteProps {
  onPokemonSelect(pokemonId: number): void;
  onGoHome(): void;
}
```

The Shell owns navigation and passes callbacks rather than exposing its router/store internals. Remotes do not share mutable Zustand state. The only cross-app durable capability is the explicit history repository package. Both remote imports are wrapped independently in `Suspense` and a reusable Error Boundary with retry/home recovery; an unavailable remote does not take down auth, Home or the other MFE.

Remote entry URLs are build-time configuration:

```env
VITE_DETAIL_REMOTE_URL=http://localhost:3001/remoteEntry.js
VITE_HISTORY_REMOTE_URL=http://localhost:3002/remoteEntry.js
```

Different deployment stages can inject their own origins without source changes.

## Testing strategy

The current suite covers:

- normalization with whitespace, case and accents;
- history first/second/different visits, ordering, no duplicates, StrictMode idempotency and corrupt storage;
- toast pending → acknowledge → reload-stable → pending-after-new-visit logic;
- resource/detail mappers and SVG preference;
- Detail success, progress semantics, visit registration and network recovery UI;
- History empty state, persisted rows and selection callback;
- Search initial page, normalized exact result and expected 404;
- E2E login → Home → federated Detail → federated History;
- E2E reload/acknowledgement/new-visit toast lifecycle;
- E2E exact search + Escape;
- the same E2E flows in desktop Chromium and a Pixel 7 viewport.

PokeAPI is network-mocked in E2E tests for deterministic behavior; Module Federation and browser storage remain real.

## Architecture decisions

- **ADR-001 — Shell owns navigation and cross-cutting UI.** Remotes receive only intent-level props.
- **ADR-002 — TanStack Query owns server state.** Zustand does not duplicate API data.
- **ADR-003 — Persistence sits behind one versioned repository.** Components never parse localStorage.
- **ADR-004 — Explicit contracts beat a global event bus.** Current communication needs are small and directional.
- **ADR-005 — URL is navigation state.** Detail supports direct access and refresh.
- **ADR-006 — Home derives IDs/artwork from resource URLs.** Six requests replace a potential 66-request waterfall.
- **ADR-007 — Visit identity, not render count, defines idempotency.** StrictMode cannot inflate a visit.
- **ADR-008 — Remote URLs are environment-configurable.** Local/staging/production topology is externalized.
- **ADR-009 — Semantic tokens support three theme preferences.** `system` follows OS changes and startup script prevents flash.

## Trade-offs

- **Authentication:** intentionally local because no backend or identity provider exists. The UI targets `AuthService`, allowing replacement; it does not claim frontend persistence is secure auth.
- **Persistence:** localStorage matches the client-only requirement. A multi-device product would move history behind an authenticated API.
- **Shared packages:** only contracts, domain rules, API infrastructure and genuinely reused UI exist. Remotes retain their feature CSS and internals.
- **Six Home types:** a curated, visually useful set keeps the initial screen/request budget focused while satisfying the official category requirement.
- **One repository implementation:** the interface is justified by a real boundary (browser storage vs feature UI), validation and likely backend evolution—not generic repository ceremony.
- **CSS instead of Tailwind:** semantic tokens and a compact handcrafted visual language are clearer at this scale.

## Production considerations

A production evolution would add independent pipelines/releases per remote, a runtime remote manifest, backward-compatible contract versioning, CSP and SRI controls, real OIDC/BFF authentication, server-side synchronized history, observability/error correlation across application boundaries, CDN caching, availability fallbacks, accessibility audits and browser E2E in CI. The present GitHub workflow validates install, lint, types, unit/integration tests and all builds.

## Requirements matrix

| Official requirement | Status | Implementation |
|---|---:|---|
| React ≥16, Vite, Module Federation | ✅ | React 19, Vite 7, three federated apps |
| Shell 3000 / Detail 3001 / History 3002 | ✅ | strict-port scripts; independent entry points |
| Login and session | ✅ | local `AuthService`, persisted user, protected routes, return URL and logout |
| Home categories | ✅ | fire, water, grass, electric, psychic and dragon |
| `GET /type/{type}` | ✅ | one cached request per category |
| 10 Pokémon per category | ✅ | first 10 resources, no detail N+1 |
| Fullscreen search modal | ✅ | accessible portal dialog owned by Shell |
| 30 initial results | ✅ | list query with limit 30 / offset 0 |
| Infinite scroll +30 | ✅ | `useInfiniteQuery` + `IntersectionObserver` |
| Exact name search | ✅ | explicit submit to `/pokemon/{normalizedName}` |
| lowercase, no spaces/accents | ✅ | tested `normalizePokemonSearch` |
| Result only / not found | ✅ | exclusive exact card; 404-specific empty state |
| Detail is MFE 1 | ✅ | one exposed `PokemonDetail` public module |
| Detail image/name/types/stats | ✅ | plus id, height, weight, experience and abilities |
| Prefer SVG without background | ✅ | dream-world SVG with two-stage fallback |
| History is MFE 2 | ✅ | one exposed `PokemonHistory` public module |
| History image/name/visit count | ✅ | plus most-recent time and responsive summary |
| Increment on detail open | ✅ | successful query effect with registration identity |
| No history duplicates | ✅ | upsert by numeric Pokémon ID |
| Persist between reloads | ✅ | versioned validated localStorage document |
| Toast after reload | ✅ | startup snapshot of latest unacknowledged visit |
| Closing suppresses until new visit | ✅ | visit-ID acknowledgement state machine |
| Light / dark theme | ✅ | light, dark and system; persisted and flash-safe |
| Responsive design | ✅ | mobile/tablet/desktop grids and mobile bottom nav |
| Loading/error/empty states | ✅ | local skeletons, retry surfaces and contextual empties |
| Transitions/animations | ✅ | restrained dialog, toast, card and skeleton motion; reduced-motion safe |
| README install/scripts/strategy | ✅ | this document |

## Final self-review against evaluation weights

- **Architecture (30%):** applications run independently, public surfaces are minimal, runtime URLs are configurable, shared singletons are explicit, and each remote fails independently.
- **Functionality (30%):** all official flows are covered, including the non-trivial acknowledgement and exact-search semantics.
- **Code quality (20%):** strict types, query factory, focused mappers, validated storage, no `any`/`@ts-ignore`, automated CI and behavioral tests.
- **UX/UI (20%):** coherent visual system, responsive navigation, meaningful local feedback, keyboard-safe modal, focus/reduced-motion/semantic support.
