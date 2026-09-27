import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import './index.css'

// Optional Sentry: set VITE_SENTRY_DSN to enable production error tracking.
// Dynamically imported so the SDK never lands in the bundle when unused.
if (import.meta.env.VITE_SENTRY_DSN) {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string
  void import('@sentry/react').then(S =>
    S.init({ dsn, tracesSampleRate: 0.1 }),
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
