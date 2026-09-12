import { localAuthService, useAuthStore } from '@pokedex/domain';
import { Button } from '@pokedex/ui';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('trainer@acity.dev');
  const [password, setPassword] = useState('pokedex');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate(); const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Ingresa un correo válido.'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setSubmitting(true);
    try { const user = await localAuthService.login({ email, password }); setUser(user); navigate(from, { replace: true }); }
    catch { setError('No fue posible iniciar sesión. Inténtalo nuevamente.'); }
    finally { setSubmitting(false); }
  };
  return <main className="login-page"><section className="login-story"><div className="brand brand--light"><span className="brand-mark"><i/></span><span>ATLAS<small>POKÉDEX</small></span></div><div><p className="eyebrow">Archivo de campo · Kanto</p><h1>Conoce cada especie.<br/><em>Recuerda cada encuentro.</em></h1><p>Una experiencia sobria para explorar tipos, estudiar estadísticas y continuar exactamente donde lo dejaste.</p></div><div className="login-index"><span>001</span><span>151</span><i/></div></section>
    <section className="login-form-wrap"><form className="login-form" onSubmit={(event) => void submit(event)} noValidate><p className="eyebrow">Acceso de entrenador</p><h2>Bienvenido de vuelta</h2><p>Tu sesión es local y demostrativa. No almacenamos tu contraseña.</p><label>Correo electrónico<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(error)}/></label><label>Contraseña<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error)}/></label>{error && <p className="form-error" role="alert">{error}</p>}<Button type="submit" disabled={submitting}>{submitting ? 'Ingresando…' : 'Ingresar al Atlas'} <span aria-hidden="true">→</span></Button><small>Demo: cualquier email válido y contraseña de 6+ caracteres.</small></form></section></main>;
}
