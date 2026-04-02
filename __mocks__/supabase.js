const mockSession = { access_token: 'test-token', user: { id: 'user-123', email: 'test@example.com' } };
const mockSupabase = {
  auth: {
    getSession: jest.fn(() => Promise.resolve({ data: { session: mockSession } })),
    onAuthStateChange: jest.fn((cb) => {
      cb('SIGNED_IN', mockSession);
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    }),
    signInWithPassword: jest.fn(() => Promise.resolve({ data: { session: mockSession }, error: null })),
    signUp: jest.fn(() => Promise.resolve({ data: { session: mockSession }, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
  },
};
module.exports = { createClient: jest.fn(() => mockSupabase), supabase: mockSupabase };
