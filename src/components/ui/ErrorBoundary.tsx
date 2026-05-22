import { Component, type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-4xl">⚠️</p>
          <p className="text-white font-black text-xl" style={{ fontFamily: "Syne, sans-serif" }}>
            Algo salió mal
          </p>
          <p className="text-[#8E8E93] text-sm leading-relaxed">
            Ocurrió un error inesperado. Ya lo registramos automáticamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-3 bg-brand text-black font-bold rounded-2xl text-sm"
          >
            Recargar app
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
