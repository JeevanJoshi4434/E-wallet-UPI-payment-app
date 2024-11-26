"use client";
import { ToastProvider } from '@/context/ToastContext'
import React from 'react'
import SignupWindow from './SignupUser'

const page = () => {
  return (
    <ToastProvider>
      <SignupWindow />
    </ToastProvider>
  )
}

export default page