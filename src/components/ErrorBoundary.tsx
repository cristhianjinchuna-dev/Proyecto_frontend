import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Catches rendering errors so the app shows a message instead of a blank page
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div role="alert" className="mx-auto my-16 max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-xl font-bold text-red-700">Algo salió mal</h2>
        <p className="mt-2 text-sm text-red-600">Ocurrió un error al mostrar esta página.</p>
        {import.meta.env.DEV && (
          <pre className="mt-4 overflow-auto rounded-lg bg-white p-3 text-left text-xs text-red-800">
            {this.state.error.message}
          </pre>
        )}
        <button
          type="button"
          onClick={() => window.location.assign('/')}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Volver al inicio
        </button>
      </div>
    );
  }
}