
import { useEffect } from 'react';
import useBrowserCompatibility from './use-browser-compatibility';

/**
 * Hook that consolidates all app initialization logic in one place
 * This helps ensure consistent behavior across the application
 */
export function useAppInit() {
  const { syncAllData } = useBrowserCompatibility();
  
  useEffect(() => {
    // Sync data on app initialization
    syncAllData();
    
    // Listen for visibility changes (tab focus/blur)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh data when tab becomes visible again
        syncAllData();
      }
    };
    
    // Listen for online/offline events
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        console.log('Back online, refreshing data...');
        syncAllData();
      } else {
        console.log('Offline mode detected');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [syncAllData]);
  
  return null;
}

export default useAppInit;
