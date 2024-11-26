// context/ToastContext.js
import Toast from "@/components/toast/Toast";
import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, duration = 3000, position = "top-right", type="info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, duration, position, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            duration={toast.duration}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            position={toast.position}
            type={toast.type}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
