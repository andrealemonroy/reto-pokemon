import { localAuthService, useAuthStore } from '@pokedex/domain/auth';
import { PokemonImage } from '@pokedex/ui/pokemon';
import { Button, PokedexBrand, TextField } from '@pokedex/ui/primitives';
import { ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('metrica@gmail.com');
  const [password, setPassword] = useState('pokedex');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Ingresa un correo válido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setSubmitting(true);
    try {
      const user = await localAuthService.login({ email, password });
      setUser(user);
      navigate(from, { replace: true });
    } catch {
      setError('No fue posible iniciar sesión. Inténtalo nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand">
          <PokedexBrand />
        </div>
        <div className="login-art" aria-hidden="true">
          <span>025</span>
          <PokemonImage
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/25.png"
            fallbackSrc="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/25.svg"
            name="pikachu"
          />
        </div>
        <div className="login-caption">
          <p>Tu Pokédex personal</p>
          <span>Busca Pokémon y conserva tu historial de visitas.</span>
        </div>
      </section>
      <section className="login-form-wrap">
        <form className="login-form" onSubmit={(event) => void submit(event)} noValidate>
          <div className="login-form__brand">
            <PokedexBrand />
          </div>
          <div className="login-form__heading">
            <p>Bienvenido de vuelta</p>
            <h1>Ingresa tus datos</h1>
          </div>
          <TextField
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error)}
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(error)}
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Ingresar'}
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
          <small>Correo: metrica@gmail.com Contraseña: pokedex</small>
        </form>
      </section>
    </main>
  );
}
