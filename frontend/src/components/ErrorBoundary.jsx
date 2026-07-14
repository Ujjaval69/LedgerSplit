import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6 text-ink">
          <div className="bg-card border border-line rounded-2xl p-8 max-w-md w-full shadow-modal text-center animate-scaleIn space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center shadow-sm">
              <AlertTriangle size={24} />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-sans font-extrabold text-xl tracking-tight">Something went wrong</h2>
              <p className="text-xs text-inksoft leading-relaxed">
                LedgerSplit encountered an unexpected rendering error. Don't worry, your ledger balance data is safe!
              </p>
            </div>

            {this.state.error && (
              <div className="bg-paper border border-line rounded-xl p-3.5 text-[11px] font-mono text-red-500 break-words text-left max-h-36 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 border border-line bg-card text-ink px-4 py-3 rounded-xl font-bold text-xs hover:bg-paper active:scale-95 transition"
              >
                <RefreshCw size={14} /> Reload
              </button>
              <button
                onClick={() => { window.location.href = "/"; }}
                className="flex-1 flex items-center justify-center gap-2 bg-brand text-white px-4 py-3 rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition shadow-sm"
              >
                <Home size={14} /> Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
