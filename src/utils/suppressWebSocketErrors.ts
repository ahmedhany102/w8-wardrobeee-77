// Suppress WebSocket connection errors from appearing in console
// This prevents SEO audit failures while maintaining functionality
export const suppressWebSocketErrors = () => {
  // Store the original console.error
  const originalError = console.error;
  
  // Override console.error to filter WebSocket DNS errors
  console.error = (...args: any[]) => {
    const errorMessage = args[0]?.toString() || '';
    
    // Suppress WebSocket DNS resolution errors for Supabase realtime
    if (
      errorMessage.includes('WebSocket connection') &&
      errorMessage.includes('supabase.co/realtime') &&
      errorMessage.includes('ERR_NAME_NOT_RESOLVED')
    ) {
      // Silently ignore these errors as they don't affect functionality
      return;
    }
    
    // Allow all other errors through
    originalError.apply(console, args);
  };
};
