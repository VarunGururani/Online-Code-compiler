import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
};

const styles = {
  success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
  error: 'border-rose-200 bg-rose-50/90 text-rose-900',
  info: 'border-blue-200 bg-blue-50/90 text-blue-900',
  warning: 'border-amber-200 bg-amber-50/90 text-amber-900',
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-xl border shadow-lg backdrop-blur-sm text-xs font-medium transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            styles[toast.type] || styles.info
          }`}
        >
          {icons[toast.type] || icons.info}
          <div className="flex-1 pt-0.5 leading-snug">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded hover:bg-black/5"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
