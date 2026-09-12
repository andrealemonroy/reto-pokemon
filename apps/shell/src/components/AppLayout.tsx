import { localAuthService, useAuthStore } from '@pokedex/domain/auth';
import { Button, PokedexBrand } from '@pokedex/ui/primitives';
import { Clock3, Compass, Search } from 'lucide-react';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LatestVisitToast } from './LatestVisitToast';
import { SearchDialog } from './SearchDialog';

export function AppLayout({ children }: PropsWithChildren) {
  const [searchOpen, setSearchOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  useEffect(() => {
    const openSearch = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', openSearch);
    return () => window.removeEventListener('keydown', openSearch);
  }, []);
  const logout = async () => {
    await localAuthService.logout();
    setUser(null);
    navigate('/login');
  };
  return (
    <>
      <div className="app-shell" inert={searchOpen ? true : undefined}>
        <a href="#main-content" className="skip-link">
          Saltar al contenido
        </a>
        <header className="topbar">
          <NavLink to="/" className="brand" aria-label="Pokédex, inicio">
            <PokedexBrand compact />
          </NavLink>
          <nav aria-label="Navegación principal">
            <NavLink to="/" end>
              <Compass size={17} aria-hidden="true" />
              Explorar
            </NavLink>
            <NavLink to="/history">
              <Clock3 size={17} aria-hidden="true" />
              Historial
            </NavLink>
          </nav>
          <div className="topbar-actions">
            <button
              className="search-trigger"
              onClick={() => setSearchOpen(true)}
              aria-haspopup="dialog"
              aria-label="Buscar Pokémon"
            >
              <Search size={18} aria-hidden="true" />
              <span className="search-label">Buscar Pokémon</span>
              <kbd>⌘ K</kbd>
            </button>
            <details className="user-menu">
              <summary aria-label="Menú de usuario">
                <span>{user?.displayName.charAt(0).toUpperCase()}</span>
              </summary>
              <div>
                <p>
                  {user?.displayName}
                  <small>{user?.email}</small>
                </p>
                <Button variant="ghost" onClick={() => void logout()}>
                  Cerrar sesión
                </Button>
              </div>
            </details>
          </div>
        </header>
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <footer>
          <span>Pokédex</span>
          <span>Datos de PokéAPI</span>
        </footer>
        <nav className="mobile-nav" aria-label="Navegación móvil">
          <NavLink to="/" end>
            <Compass aria-hidden="true" />
            Explorar
          </NavLink>
          <button onClick={() => setSearchOpen(true)}>
            <Search aria-hidden="true" />
            Buscar
          </button>
          <NavLink to="/history">
            <Clock3 aria-hidden="true" />
            Historial
          </NavLink>
        </nav>
        <LatestVisitToast />
      </div>
      {searchOpen && (
        <SearchDialog
          onClose={() => setSearchOpen(false)}
          onSelect={(id) => {
            setSearchOpen(false);
            navigate(`/pokemon/${id}`);
          }}
        />
      )}
    </>
  );
}
