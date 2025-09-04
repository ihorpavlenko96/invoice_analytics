import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import LandingPage from './pages/index.page.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <LandingPage />
    </App>
  </StrictMode>,
);
