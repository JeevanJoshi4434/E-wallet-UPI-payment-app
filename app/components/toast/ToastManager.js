// components/ToastManager.js
import React, { useState } from "react";
import Toast from "./Toast";

const ToastManager = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, duration = 3000, position = "top-right") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, duration, position }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
    };

    return (
        <div>
            <div>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        duration={toast.duration}
                        onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                        position={toast.position} // Pass position to Toast
                    />
                ))}
            </div>
        </div>
    );
};

export default ToastManager;
