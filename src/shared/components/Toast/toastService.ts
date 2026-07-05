import type { ToastVariant } from "./ToastProvider";

type ToastHandler = (message: string, variant?: ToastVariant) => void;

let handler: ToastHandler | null = null;

export function registerToastHandler(fn: ToastHandler | null): void {
  handler = fn;
}

export function dispatchToast(message: string, variant?: ToastVariant): void {
  handler?.(message, variant);
}
