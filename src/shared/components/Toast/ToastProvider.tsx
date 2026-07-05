import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { registerToastHandler } from "./toastService";

export type ToastVariant = "error" | "success" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  error: "bg-red-600 text-white",
  success: "bg-green-600 text-white",
  info: "bg-slate-800 text-white",
};

const AUTO_DISMISS_MS = 6000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
    },
    [dismissToast]
  );

  useEffect(() => {
    registerToastHandler(showToast);
    return () => registerToastHandler(null);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 inset-x-0 z-[9999] m-auto w-4/5 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-lg shadow-lg px-4 py-3 text-sm transition-opacity animate-shake ${VARIANT_STYLES[toast.variant]}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none">
              <circle cx="12" cy="12" r="10" fill="white" />
              <path d="M15 9L9 15M9 9L15 15" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="whitespace-pre-line">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 leading-none text-white/80 hover:text-white"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
