"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext();

export function SupabaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth initialization taking too long, setting loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        // Add timeout to the session request
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session request timeout')), 3000)
        );
        
        const { data } = await Promise.race([sessionPromise, timeoutPromise]);
        setSession(data.session);
        setUser(data.session?.user ?? null);
        clearTimeout(loadingTimeout);
      } catch (error) {
        console.error('Error getting session:', error);
        setSession(null);
        setUser(null);
        clearTimeout(loadingTimeout);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // Ensure loading is false after auth state changes
      clearTimeout(loadingTimeout);
    });

    return () => {
      listener?.subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  return useContext(AuthContext);
}