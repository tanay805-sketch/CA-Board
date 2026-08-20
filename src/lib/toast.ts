import { useState, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

type ToastListener = (toasts: ToastMessage[]) => void;

let toasts: ToastMessage[] = [];
let listeners: ToastListener[] = [];

export function showToast(title: string, message?: string, type: ToastMessage['type'] = 'success') {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastMessage = { id, type, title, message };
  toasts = [...toasts, newToast];
  notifyListeners();

  setTimeout(() => {
    removeToast(id);
  }, 4000);
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

function notifyListeners() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function useToasts() {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>(toasts);

  useEffect(() => {
    const listener: ToastListener = (updatedToasts) => {
      setCurrentToasts(updatedToasts);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return { toasts: currentToasts, removeToast };
}
