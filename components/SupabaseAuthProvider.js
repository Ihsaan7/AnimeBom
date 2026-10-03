"use client";

// Re-export from the new MongoDB-backed AuthProvider for 100% backward compatibility
export { AuthProvider, SupabaseAuthProvider, useAuth, useSupabaseAuth } from "./AuthProvider";