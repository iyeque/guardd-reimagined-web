import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import ThemeProvider from './context/ThemeContext.tsx'

// WellnessProvider deliberately lives inside ProfileProvider (see App.tsx): the
// content age group is a per-profile preference, so it has to be able to read the
// current profile. Wrapping it here instead would leave it above the profile
// context and unable to see profile switches.
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ErrorBoundary>
);
