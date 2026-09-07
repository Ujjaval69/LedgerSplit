import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      {children}
      {/* Toast container */}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full flex items-center gap-3 bg-card/90 backdrop-blur-xl border p-3.5 rounded-2xl shadow-modal animate-fadeInUp text-xs text-ink transition-all duration-200 ${
              t.type === "success"
                ? "border-brand/30 shadow-brand/5"
                : t.type === "error"
                ? "border-red-500/30 shadow-red-500/5"
                : "border-line"
            }`}
          >
            <div
              className={`shrink-0 p-1.5 rounded-xl flex items-center justify-center ${
                t.type === "success"
                  ? "bg-brand/10 text-brand"
                  : t.type === "error"
                  ? "bg-red-500/10 text-red-500"
                  : "bg-paper text-inksoft"
              }`}
            >
              {t.type === "success" && <CheckCircle2 size={15} />}
              {t.type === "error" && <AlertCircle size={15} />}
              {t.type === "info" && <Info size={15} />}
            </div>

            <div className="flex-1 font-medium leading-snug break-words pr-1 text-ink">
              {t.message}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 p-1 rounded-lg text-inksoft hover:text-ink hover:bg-paper transition"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
