"use client";
import { LoginWindow } from '@/components/component/login-window';
import { ToastProvider } from '@/context/ToastContext';
import React from 'react'

const Login = () => {

  return (
    <ToastProvider>
      <LoginWindow />
    </ToastProvider>
  );
}

export default Login