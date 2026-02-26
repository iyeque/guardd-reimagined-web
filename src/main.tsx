import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import ThemeProvider from './context/ThemeContext.tsx'
import { WellnessProvider } from './context/WellnessContext.tsx'

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider>
      <WellnessProvider>
        <App />
      </WellnessProvider>
    </ThemeProvider>
  </ErrorBoundary>
);