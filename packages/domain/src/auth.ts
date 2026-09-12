import { create } from 'zustand';

export interface User { readonly email: string; readonly displayName: string }
export interface Credentials { readonly email: string; readonly password: string }
export interface AuthService {
  login(credentials: Credentials): Promise<User>;
  logout(): Promise<void>;
  getSession(): User | null;
}

const SESSION_KEY = 'acity-pokedex.session.v1';

function readSession(): User | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null');
    if (!value || typeof value !== 'object' || !('email' in value) || typeof value.email !== 'string') return null;
    return { email: value.email, displayName: value.email.split('@')[0] || 'Entrenador' };
  } catch { return null; }
}

export const localAuthService: AuthService = {
  async login({ email, password }) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6) throw new Error('Credenciales inválidas.');
    const user = { email, displayName: email.split('@')[0] || 'Entrenador' };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },
  async logout() { localStorage.removeItem(SESSION_KEY); },
  getSession: readSession,
};

interface AuthState {
  readonly user: User | null;
  readonly setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof localStorage === 'undefined' ? null : readSession(),
  setUser: (user) => set({ user }),
}));
