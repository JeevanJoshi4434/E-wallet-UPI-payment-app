"use client";
import { PaymentHomepage } from '@/components/component/payment-homepage'
import { ToastProvider } from '@/context/ToastContext';
import React from 'react'

const Page = () => {
  return (
    <ToastProvider>
      <PaymentHomepage />
    </ToastProvider>
  );
}

export default Page