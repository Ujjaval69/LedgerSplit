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
      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto w-full flex items-start gap-3 bg-card border border-line p-4 rounded-2xl shadow-modal animate-slideInRight text-xs text-ink transition-all duration-200"
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 size={16} className="text-brand" />}
              {t.type === "error" && <AlertCircle size={16} className="text-red-500" />}
              {t.type === "info" && <Info size={16} className="text-blue-500" />}
            </div>
            
            <div className="flex-1 font-semibold leading-relaxed break-words pr-2">
              {t.message}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-0.5 rounded-lg text-inksoft hover:text-ink hover:bg-paper transition"
            >
              <X size={14} />
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
