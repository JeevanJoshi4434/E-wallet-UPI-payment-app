
"use client";

import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from "axios";
import { useToast } from "@/context/ToastContext";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { login } from "@/redux/authActions";
import { usePin } from "@/context/PinProvider";

export function LoginWindow() {

  const { addToast } = useToast();
  const dispatch = useDispatch();
  const { setIsVerified } = usePin();


  const [userInfo, setUserInfo] = useState(null);
  const [pin, setPIN] = React.useState(["", "", "", ""])
  const [fields, setFields] = useState({
    number: "",
    pin: null || Number,
    password: 'password'
  })

  async function loginUser() {
    try {
      const PIN = pin.join("");
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVICE_MAIN}/api/v1/login_user`, {
        number: fields.number,
        pin: PIN
      });
      const data = response.data;
      if(data.success){
        dispatch(login(data.user, data.token));
        setIsVerified(true);
        sessionStorage.setItem('verified', 'true');
        window.location.href = "/home";
      }
    } catch (error) {
      if(error.response?.status === 404){
        window.location.href = `/signup?tel=${fields.number}`;
      }
      window.alert(error);
      addToast(error.response?.data.message || "Something went wrong", 3000, "top-right", "error");

    }
  }
  const handleOtpChange = (index, value) => {
    const newPIN = [...pin]
    newPIN[index] = value
    setPIN(newPIN)
    if (value.length === 1) {
      const nextInput = document.querySelector(`#pin-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }
  const handleOtpBackspace = (index) => {
    const newPIN = [...pin]
    newPIN[index] = ""
    setPIN(newPIN)
    if (index > 0) {
      const prevInput = document.querySelector(`#pin-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }
  }



  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/userinfo")

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        setUserInfo(data)
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    fetchUserInfo()
  }, [])

  return (
    (<div className="flex items-center justify-center h-screen bg-background">
      
      <div
        className="w-full max-w-md space-y-6 rounded-lg border border-input bg-card p-6 shadow-lg">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Welcome to WalletXpress</h2>
          <p className="text-muted-foreground">Enter your mobile number to get started.</p>
        </div>
        <form className="space-y-4">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4">
            <Input
              type="tel"
              id="mobile"
              placeholder="Enter mobile number" max={10}
              className="max-w-[200px]" value={fields.number} onChange={(e) => e.target.value.length <= 10 && setFields({ ...fields, number: e.target.value })} />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">Enter your PIN</p>
            <div className="flex gap-2">
              {pin.map((_, index) => (
                <Input
                  key={index}
                  type={fields.password}
                  id={`pin-${index}`}
                  maxLength={1}
                  value={pin[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      handleOtpBackspace(index)
                    }
                  }}
                  inputMode="numeric"
                  className="w-10 text-center border border-input rounded-md bg-background" />
              ))}
              <div
                className="w-10 text-center  rounded-md bg-background cursor-pointer flex items-center justify-center"
                onClick={() => setFields({ ...fields, password: fields.password === "password" ? "text" : "password" })}
              >
                {
                  fields.password === "text" ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />
                }
              </div>
            </div>
            <Button type="button"  onClick={loginUser} >Continue with Mobile</Button>
          </div>
        </form>
      </div >
    </div >)
  );
}
