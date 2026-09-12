import { localAuthService, useAuthStore, useThemeStore, type ThemePreference } from '@pokedex/domain';
import { Button } from '@pokedex/ui';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LatestVisitToast } from './LatestVisitToast';
import { SearchDialog } from './SearchDialog';

export function AppLayout({ children }: PropsWithChildren) {
  const [searchOpen, setSearchOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  const navigate = useNavigate();
  useEffect(() => {
    const openSearch = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', openSearch);
    return () => window.removeEventListener('keydown', openSearch);
  }, []);
  const logout = async () => { await localAuthService.logout(); setUser(null); navigate('/login'); };
  return <>
  <div className="app-shell" inert={searchOpen ? true : undefined}>
    <a href="#main-content" className="skip-link">Saltar al contenido</a>
    <header className="topbar"><NavLink to="/" className="brand" aria-label="Atlas Pokédex, inicio"><span className="brand-mark" aria-hidden="true"><i/></span><span>ATLAS<small>POKÉDEX</small></span></NavLink>
      <nav aria-label="Navegación principal"><NavLink to="/" end>Explorar</NavLink><NavLink to="/history">Historial</NavLink></nav>
      <div className="topbar-actions"><button className="search-trigger" onClick={() => setSearchOpen(true)} aria-haspopup="dialog" aria-label="Buscar Pokémon"><span aria-hidden="true">⌕</span><span className="search-label">Buscar Pokémon</span><kbd>⌘ K</kbd></button>
        <label className="theme-select"><span className="sr-only">Tema</span><select value={preference} onChange={(event) => setPreference(event.target.value as ThemePreference)}><option value="system">Sistema</option><option value="light">Claro</option><option value="dark">Oscuro</option></select></label>
        <details className="user-menu"><summary aria-label="Menú de usuario"><span>{user?.displayName.charAt(0).toUpperCase()}</span></summary><div><p>{user?.displayName}<small>{user?.email}</small></p><Button variant="ghost" onClick={() => void logout()}>Cerrar sesión</Button></div></details>
      </div>
    </header>
    <div id="main-content" tabIndex={-1}>{children}</div>
    <footer><span>Atlas Pokédex</span><span>Datos de PokéAPI · Persistencia local</span></footer>
    <nav className="mobile-nav" aria-label="Navegación móvil"><NavLink to="/" end><span aria-hidden="true">⌂</span>Explorar</NavLink><button onClick={() => setSearchOpen(true)}><span aria-hidden="true">⌕</span>Buscar</button><NavLink to="/history"><span aria-hidden="true">◷</span>Historial</NavLink></nav>
    <LatestVisitToast/>
  </div>
  {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} onSelect={(id) => { setSearchOpen(false); navigate(`/pokemon/${id}`); }}/>} 
  </>;
}
