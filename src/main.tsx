import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { setupInstall } from '@/features/pwa/install';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/plus-jakarta-sans';
import './index.css';

setupInstall();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
