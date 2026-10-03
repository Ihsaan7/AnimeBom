"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('animebom_token') : null;
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('animebom_user') : null;

        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (isMounted) {
              setUser(parsedUser);
              setSession({ access_token: storedToken, user: parsedUser });
            }
          } catch {
            // Ignore parse error
          }
        }

        const res = await fetch('/api/auth/me', {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.user) {
              setUser(data.user);
              setSession({ access_token: storedToken || 'cookie-session', user: data.user });
              if (typeof window !== 'undefined') {
                localStorage.setItem('animebom_user', JSON.stringify(data.user));
              }
            } else {
              setUser(null);
              setSession(null);
              if (typeof window !== 'undefined') {
                localStorage.removeItem('animebom_token');
                localStorage.removeItem('animebom_user');
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      setUser(data.user);
      setSession({ access_token: data.token, user: data.user });
      if (typeof window !== 'undefined') {
        localStorage.setItem('animebom_token', data.token);
        localStorage.setItem('animebom_user', JSON.stringify(data.user));
      }

      return { user: data.user, token: data.token };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      setUser(data.user);
      setSession({ access_token: data.token, user: data.user });
      if (typeof window !== 'undefined') {
        localStorage.setItem('animebom_token', data.token);
        localStorage.setItem('animebom_user', JSON.stringify(data.user));
      }

      return { user: data.user, token: data.token };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (e) {
      console.error('Error signing out:', e);
    }
    setUser(null);
    setSession(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('animebom_token');
      localStorage.removeItem('animebom_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Backward-compatible alias for existing imports
export function useSupabaseAuth() {
  return useContext(AuthContext);
}
export { AuthProvider as SupabaseAuthProvider };
