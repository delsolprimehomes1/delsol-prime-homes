import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure i18n is loaded before rendering
const initApp = async () => {
  try {
    // Import i18n to trigger its initialization
    await import('./i18n');
    
    // Small delay to ensure i18n is fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    createRoot(document.getElementById("root")!).render(<App />);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Fallback: render without i18n if there's an issue
    createRoot(document.getElementById("root")!).render(<App />);
  }
};

initApp();
