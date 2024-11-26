// components/Toast.js
import React, { useEffect, useRef } from "react";

const Toast = ({ message, duration, onClose, position, type }) => {
  const toastRef = useRef(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    const handleMouseEnter = () => clearTimeout(timer);
    const handleMouseLeave = () => {
      // Restart the timer on mouse leave
      setTimeout(() => {
        onClose();
      }, duration);
    };

    const toastElement = toastRef.current;

    if (toastElement) {
      toastElement.addEventListener("mouseenter", handleMouseEnter);
      toastElement.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      clearTimeout(timer);
      if (toastElement) {
        toastElement.removeEventListener("mouseenter", handleMouseEnter);
        toastElement.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [duration, onClose]);

  // Tailwind classes based on position prop
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "center": "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
  }[position] || "top-4 right-4"; // Default to top-right

  const toastType = {
    "info": "text-blue-500",
    "success": "text-green-500",
    "warning": "text-yellow-500",
    "error": "text-red-500",
  }[type] || "text-blue-500";

  return (
    <div
      ref={toastRef}
      className={`fixed ${positionClasses} p-4 z-50 bg-white ${toastType} rounded shadow-lg transition-opacity duration-300`}
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
