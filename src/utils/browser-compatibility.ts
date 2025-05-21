
/**
 * Function to ensure consistent behavior across different browsers
 * Call this on app startup to apply compatibility fixes
 */
export function ensureBrowserCompatibility() {
  // Register compatibility check on DOMContentLoaded
  window.addEventListener('DOMContentLoaded', () => {
    console.log('Applying browser compatibility fixes...');
    
    // Fix for mobile responsive viewport
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const newViewportMeta = document.createElement('meta');
      newViewportMeta.name = 'viewport';
      newViewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(newViewportMeta);
    }
    
    // Test localStorage functionality
    try {
      localStorage.setItem('browserCheck', 'ok');
      localStorage.removeItem('browserCheck');
    } catch (error) {
      console.error('localStorage not available:', error);
      alert('This site requires local storage to work properly. Please enable cookies and local storage in your browser settings.');
    }
    
    // Force apply any saved contact settings to ensure footer consistency
    const savedSettings = localStorage.getItem('contactSettings');
    if (!savedSettings) {
      // If no settings found, add default contact settings
      const defaultSettings = {
        developerName: 'Ahmed Hany',
        developerUrl: 'https://ahmedhany.dev',
        facebook: 'https://www.facebook.com/share/16LEN8zQG3/',
        instagram: 'https://www.instagram.com/a7med._.hany/',
        linkedin: 'https://www.linkedin.com/in/ahmed-hany-436342257',
        whatsapp: 'https://wa.me/qr/2O2JSVLBTNEIJ1'
      };
      localStorage.setItem('contactSettings', JSON.stringify(defaultSettings));
    }

    console.log('Browser compatibility check completed');
  });
  
  // Add global data refresh events
  window.addEventListener('dataUpdated', (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail?.source) {
      console.log(`Refreshing data from ${customEvent.detail.source}...`);
      
      // Trigger appropriate refresh actions based on source
      switch (customEvent.detail.source) {
        case 'products':
          window.dispatchEvent(new Event('productsUpdated'));
          break;
        case 'cart':
          window.dispatchEvent(new Event('cartUpdated'));
          break;
        case 'homeAds':
          window.dispatchEvent(new Event('adsUpdated'));
          break;
        case 'contactSettings':
          // Force refresh page to apply new footer settings
          window.location.reload();
          break;
      }
    }
  });
}

// Call this function immediately
ensureBrowserCompatibility();

// Expose a global function for other parts of the app to trigger a refresh
(window as any).refreshAppData = () => {
  ['productsUpdated', 'cartUpdated', 'adsUpdated'].forEach(eventName => {
    window.dispatchEvent(new Event(eventName));
  });
};

export default ensureBrowserCompatibility;
