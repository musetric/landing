import '@fontsource-variable/fraunces/index.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/inter/index.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './app/App.js';
import { initI18next } from './translations/index.js';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

await initI18next();

const app = (
  <StrictMode>
    <App pathname={window.location.pathname} />
  </StrictMode>
);

if (rootElement.firstElementChild) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
