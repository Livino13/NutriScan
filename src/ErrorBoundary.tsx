import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(err: unknown) {
    console.error('Uncaught UI error:', err)
    if (import.meta.env.VITE_SENTRY_DSN) {
      void import('@sentry/react').then(S => S.captureException(err))
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#F0FDF8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 398, background: '#fff', borderRadius: 20, padding: 32, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>😅</div>
            <h1 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Something went wrong
            </h1>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#94A3B8', lineHeight: 1.6 }}>
              Your logged data is safe. Try reloading this section.
            </p>
            <button
              onClick={this.handleReset}
              style={{ width: '100%', padding: '14px', background: '#AACB73', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
