// Deprecated: Supabase has been replaced with MongoDB and custom JWT Auth
// This mock object ensures any remaining references fail gracefully without crashing
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({ data: null, error: new Error('Please use the MongoDB auth system') }),
    signUp: async () => ({ data: null, error: new Error('Please use the MongoDB auth system') }),
    signInWithOtp: async () => ({ data: null, error: new Error('Please use the MongoDB auth system') }),
    verifyOtp: async () => ({ data: null, error: new Error('Please use the MongoDB auth system') }),
  }
};