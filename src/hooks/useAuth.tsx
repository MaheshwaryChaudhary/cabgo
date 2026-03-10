import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials: any) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (data.user) setUser(data.user);
      return data;
    } catch (e) {
      console.error('Login error:', e);
      return { error: 'Failed to login' };
    }
  };

  const signup = async (details: any) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
      });
      const data = await res.json();
      // We don't auto-login here to satisfy the requirement of "signin in login after signup"
      return data;
    } catch (e) {
      console.error('Signup error:', e);
      return { error: 'Failed to signup' };
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch (e) {
      console.error('Refresh user error:', e);
    }
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
