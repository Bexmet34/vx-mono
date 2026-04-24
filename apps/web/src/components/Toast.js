"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import styles from "./Toast.module.css";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return { toasts, showToast };
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{toast.message}</span>
          <button onClick={() => onRemove(toast.id)} className={styles.close}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
