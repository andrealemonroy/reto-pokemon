# Reto técnico frontend senior

Aplicación de Pokémon construida con React, Vite y Module Federation. Incluye autenticación local, listado por tipos, búsqueda, detalle e historial de visitas.

## Ejecución

Requiere Node.js 22 o superior.

```bash
npm install
npm run dev
```

El comando inicia las tres aplicaciones:

| Aplicación | URL                   |
| ---------- | --------------------- |
| Shell      | http://localhost:3000 |
| Detalle    | http://localhost:3001 |
| Historial  | http://localhost:3002 |

Para iniciar una aplicación por separado:

```bash
npm run dev:shell
npm run dev:detail
npm run dev:history
```

En el login se puede usar cualquier correo válido y una contraseña de al menos seis caracteres. La autenticación es local; la contraseña no se almacena.

## Scripts

| Comando             | Descripción                              |
| ------------------- | ---------------------------------------- |
| `npm run lint`      | Ejecuta ESLint                           |
| `npm run format`    | Formatea el código con Prettier          |
| `npm run typecheck` | Verifica tipos con TypeScript            |
| `npm run test`      | Ejecuta Vitest                           |
| `npm run test:e2e`  | Ejecuta Playwright en escritorio y móvil |
| `npm run build`     | Construye las tres aplicaciones          |
| `npm run validate`  | Ejecuta lint, tipos, tests y build       |

La primera ejecución de Playwright puede requerir `npx playwright install chromium`.

## Arquitectura

```text
                         Shell :3000
              auth, rutas, home, búsqueda, tema
                               │
                    Module Federation
                   ┌───────────┴───────────┐
                   │                       │
          Detalle :3001            Historial :3002
                   │                       │
                   └───────────┬───────────┘
                               │
                 api · contracts · domain · ui
```

El repositorio usa npm workspaces:

```text
apps/
  shell/
  pokemon-detail/
  pokemon-history/
packages/
  api/
  contracts/
  domain/
  ui/
e2e/
```

### Responsabilidades

**Shell**

- Autenticación y rutas protegidas.
- Layout, navegación y tema.
- Home y buscador.
- Carga de los microfrontends.
- Toast de última visita.

**Detalle**

- Consulta `GET /pokemon/{id}`.
- Presentación de información, tipos y estadísticas.
- Registro de una visita cuando la consulta termina correctamente.

**Historial**

- Lectura del historial persistido.
- Orden por fecha de última visita.
- Navegación al detalle mediante un callback del Shell.

Los remotes exponen un componente cada uno. El Shell no importa componentes internos ni comparte un store mutable con ellos.

## Comunicación entre aplicaciones

Los contratos públicos están en `packages/contracts`:

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

React y React DOM se comparten como singletons. TanStack Query también se comparte entre el Shell y Detalle. Los remotes se cargan al entrar a su ruta y cada import está protegido con `Suspense` y un Error Boundary.

Las URLs se pueden configurar sin cambiar el código:

```env
VITE_DETAIL_REMOTE_URL=http://localhost:3001/remoteEntry.js
VITE_HISTORY_REMOTE_URL=http://localhost:3002/remoteEntry.js
```

## Estado

| Tipo de estado      | Solución                       |
| ------------------- | ------------------------------ |
| Datos de PokéAPI    | TanStack Query                 |
| Sesión y tema       | Zustand                        |
| Historial           | Repositorio sobre localStorage |
| Formularios y modal | Estado local de React          |
| Navegación          | React Router                   |

Los datos obtenidos de PokéAPI no se copian a Zustand.

## Acceso a datos

`packages/api` contiene el cliente HTTP, los tipos mínimos usados por la aplicación, los mappers y las query keys.

La Home hace una consulta por tipo. Los IDs se extraen de las URLs incluidas en la respuesta y se usan para construir las URLs de las imágenes. Esto evita pedir el detalle de los 60 Pokémon mostrados.

El buscador usa `useInfiniteQuery` con páginas de 30 elementos e `IntersectionObserver`. Cuando se envía un texto no vacío se normaliza y se consulta `/pokemon/{name}`. Un 404 se muestra como “No encontrado”; los errores de red permiten reintentar.

## Historial

El documento guardado tiene una versión y se valida antes de usarlo. Si el JSON está corrupto o la versión no es compatible, se parte de un historial vacío.

```text
registrar visita
  buscar por pokemon.id
  crear la entrada o incrementar visits
  actualizar lastVisitedAt
  mover la entrada al inicio
  guardar
```

Cada apertura del detalle recibe un `visitKey`. El repositorio conserva la última clave registrada para evitar incrementos duplicados por StrictMode o por la repetición de un efecto.

El toast compara el ID de la última visita con el ID de la última visita reconocida. Al cerrarlo se guarda ese ID. Una visita posterior crea otro ID y habilita nuevamente el toast para la siguiente recarga.

## Accesibilidad

- Landmarks y enlace para saltar al contenido.
- Navegación por teclado y estilos de foco.
- Modal con foco inicial, focus trap, Escape, bloqueo de scroll y restauración de foco.
- Contenido de fondo marcado como `inert` mientras el modal está abierto.
- Barras de estadísticas con semántica de `progressbar`.
- Toast con `role="status"`.
- Soporte de `prefers-reduced-motion`.

## Pruebas

Vitest y Testing Library cubren:

- Normalización de búsquedas.
- Mappers de PokéAPI.
- Registro, incremento, orden e idempotencia del historial.
- Recuperación ante localStorage corrupto.
- Ciclo de reconocimiento del toast.
- Estados de Detalle, Historial y Buscador.

Playwright cubre estos flujos en Chromium de escritorio y en un viewport móvil:

1. Login → Home → Detalle → Historial.
2. Visita → recarga → toast → cierre → nueva visita.
3. Búsqueda exacta con espacios, mayúsculas y acentos.

PokéAPI se intercepta en los E2E para evitar que una caída externa vuelva inestable la suite. Module Federation y localStorage se usan sin mocks.

## Decisiones y límites

- La autenticación es local porque el reto no proporciona backend ni proveedor de identidad.
- El historial usa localStorage porque la persistencia solicitada es del navegador.
- Se eligió CSS con variables semánticas para implementar tema claro, oscuro y del sistema.
- No se agregó un event bus; los callbacks cubren la comunicación requerida.
- La barra de estadísticas usa 180 como máximo visual. El valor real siempre se muestra junto a la barra.

Quedan fuera del alcance la autenticación y persistencia remotas, además de la infraestructura de producción.
