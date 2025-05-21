
import { useEffect } from 'react';

/**
 * Hook to handle browser compatibility issues and ensure consistent behavior
 * across different devices and browsers
 */
export function useBrowserCompatibility() {
  useEffect(() => {
    // Fix for Safari localStorage issues
    try {
      // Test localStorage functionality
      localStorage.setItem('testKey', 'test');
      localStorage.removeItem('testKey');
    } catch (error) {
      console.error('localStorage not available:', error);
      // Alert user if localStorage is unavailable (e.g., private browsing mode)
      alert('This website requires local storage to function properly. Please ensure it is enabled in your browser settings.');
    }
    
    // Polyfill for older browsers that don't support certain features
    if (!window.fetch) {
      console.warn('Fetch API not available, some features may not work correctly');
    }

    // Fix IndexedDB compatibility issues
    const checkIndexedDB = () => {
      try {
        // Test IndexedDB availability
        const request = indexedDB.open('compatibility_test', 1);
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          db.close();
          indexedDB.deleteDatabase('compatibility_test');
        };
        request.onerror = () => {
          console.warn('IndexedDB is not available, falling back to localStorage');
          // Force reload from localStorage for consistent behavior
          window.dispatchEvent(new Event('storageCheck'));
        };
      } catch (error) {
        console.error('Error checking IndexedDB availability:', error);
      }
    };
    
    checkIndexedDB();
    
    // Add event listener for cross-device/cross-browser sync
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && (
        event.key === 'products' || 
        event.key === 'cart' || 
        event.key === 'homeAds' || 
        event.key === 'contactSettings'
      )) {
        console.log(`External change detected for ${event.key}, refreshing data...`);
        // Trigger appropriate refresh events
        window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { source: event.key } }));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Method to trigger full sync across all data sources
  const syncAllData = () => {
    // Trigger events to refresh all data types
    ['productsUpdated', 'cartUpdated', 'adsUpdated'].forEach(eventName => {
      window.dispatchEvent(new Event(eventName));
    });
    console.log('Full data sync completed');
    return true;
  };
  
  return { syncAllData };
}

export default useBrowserCompatibility;
