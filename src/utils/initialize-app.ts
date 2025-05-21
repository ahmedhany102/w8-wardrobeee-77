
import './browser-compatibility';

/**
 * This file ensures that browser compatibility checks are run on app startup
 * Import this file in components that load early in the app lifecycle
 */
export default function initializeApp() {
  // Additional initialization can be added here
  console.log('App initialization complete');
}
