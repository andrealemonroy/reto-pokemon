import { lazy, Suspense, useEffect } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useAuthStore } from '@pokedex/domain/auth';
import { ErrorState, RemoteErrorBoundary, RemoteSkeleton } from '@pokedex/ui/primitives';
import { AppLayout } from './components/AppLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

const DetailRemote = lazy(() => import('remoteDetail/PokemonDetail'));
const HistoryRemote = lazy(() => import('remoteHistory/PokemonHistory'));
const pageSessionId = crypto.randomUUID();

function ProtectedLayout() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  if (!user)
    return (
      <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
    );
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function DetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pokemonId = Number(id);
  const visitKey = `${pageSessionId}:${location.key}:${pokemonId}`;
  if (!Number.isInteger(pokemonId) || pokemonId <= 0)
    return (
      <ErrorState
        title="Pokémon no válido"
        description="La dirección no contiene un número de Pokémon válido."
        onBack={() => navigate('/')}
      />
    );
  return (
    <RemoteGuard label="detalle" onHome={() => navigate('/')}>
      <DetailRemote pokemonId={pokemonId} visitKey={visitKey} onBack={() => navigate('/')} />
    </RemoteGuard>
  );
}

function HistoryRoute() {
  const navigate = useNavigate();
  return (
    <RemoteGuard label="historial" onHome={() => navigate('/')}>
      <HistoryRemote
        onPokemonSelect={(id) => navigate(`/pokemon/${id}`)}
        onGoHome={() => navigate('/')}
      />
    </RemoteGuard>
  );
}

function RemoteGuard({
  children,
  label,
  onHome,
}: {
  readonly children: React.ReactNode;
  readonly label: string;
  readonly onHome: () => void;
}) {
  return (
    <RemoteErrorBoundary
      fallback={(retry) => (
        <ErrorState
          title={`No pudimos cargar el ${label}`}
          description="La aplicación principal sigue disponible. Puedes reintentar o volver al inicio."
          onRetry={retry}
          onBack={onHome}
        />
      )}
    >
      <Suspense fallback={<RemoteSkeleton />}>{children}</Suspense>
    </RemoteErrorBoundary>
  );
}

export function App() {
  const user = useAuthStore((state) => state.user);
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<HomePage />} />
          <Route path="pokemon/:id" element={<DetailRoute />} />
          <Route path="history" element={<HistoryRoute />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
