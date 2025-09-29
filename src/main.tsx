import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ParallaxProvider } from 'react-scroll-parallax';

createRoot(document.getElementById("root")!).render(
  <ParallaxProvider>
    <App />
  </ParallaxProvider>
);
