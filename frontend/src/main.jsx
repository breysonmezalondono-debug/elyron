import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthProvider'
import { InstitutionProvider } from './context/InstitutionProvider'
import { ThemeProvider } from './theme/theme'
import './index.css'

class AppErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
          <section className="surface w-full max-w-lg p-8 text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-mint-600">
              Elyron
            </p>
            <h1 className="display mt-3 text-3xl text-ink-950">
              No pudimos cargar esta pantalla
            </h1>
            <p className="mt-2 text-sm font-medium text-ink-500">
              Recarga la página para continuar. Si el problema persiste, cierra sesión y vuelve a entrar.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-pill mt-6 bg-mint-500 text-white hover:bg-mint-600"
            >
              Recargar página
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

const rootElement = document.getElementById('root')
const root = globalThis.__elyronRoot ?? ReactDOM.createRoot(rootElement)
globalThis.__elyronRoot = root

root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <InstitutionProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </InstitutionProvider>
        </ThemeProvider>
      </AuthProvider>
    </AppErrorBoundary>
  </React.StrictMode>
)
