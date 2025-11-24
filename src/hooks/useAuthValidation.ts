// This hook is deprecated - auth validation is now handled directly in AuthContext
// Keeping this file for backwards compatibility but it's no longer used
export const useAuthValidation = () => {
  return {
    validateSessionAndUser: async () => {},
    loading: false,
    setLoading: () => {}
  };
};
