
"use client";

import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from "axios";
import { useToast } from "@/context/ToastContext";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "@/redux/authActions";
import { usePin } from "@/context/PinProvider";

export default function SignupWindow() {

    const { addToast } = useToast();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();

    const {setIsVerified} = usePin();
    const [userInfo, setUserInfo] = useState(null);
    const [otp, setOtp] = React.useState(["", "", "", "", "", ""])
    const [pin, setPIN] = React.useState(["", "", "", ""])
    const [fields, setFields] = useState({
        number: searchParams.get('tel') || "",
        pin: null || Number,
        password: 'password',
        name: "",
        screen: 0,
        userID:null
    })

    async function signupUser() {
        try {
            if (!userInfo.ip_address) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVICE_MAIN}/api/v1/create_user`, {
                phone: fields.number,
                name: fields.name,
                pin: pin.join(''),
                ip: userInfo.ip_address
            });
            const data = response.data;
            if (data.success) {
                addToast("Account Created Successfully!", 2000, "top-right", "success");
                setOtp([data.otp.charAt(0), data.otp.charAt(1), data.otp.charAt(2), data.otp.charAt(3), data.otp.charAt(4), data.otp.charAt(5)]);
                setFields({...fields, screen:3, userID: data.user.id});
            }
        } catch (error) {
            addToast(error.response?.data.message || "Some error ocurred!", 3000, "top-right", "error");
        }
    }
    
    
    async function verifyUser() {
        try {
            if(!fields.userID) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVICE_MAIN}/api/v1/verify_user`,{
                userID:fields.userID,
                OTP:otp.join("")
            });
            const data = response.data;
            if (data.success) {
                dispatch(login(data.user, data.token));
                addToast("Account Verified Successfully!", 2000, "top-right", "success");
                setIsVerified(true);
                window.location.href = '/home';
            }
        } catch (error) {
            addToast(error.response?.data.message || "Some error ocurred!", 3000, "top-right", "error");
        }
    }

    const setScreen = (screen) => {
        setFields({
            ...fields,
            screen: screen
        })
    }
    const handleOtpChange = (index, value) => {
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        if (value.length === 1) {
            const nextInput = document.querySelector(`#otp-${index + 1}`)
            if (nextInput) {
                nextInput.focus()
            }
        }
    }
    const handleOtpBackspace = (index) => {
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
        if (index > 0) {
            const prevInput = document.querySelector(`#otp-${index - 1}`)
            if (prevInput) {
                prevInput.focus()
            }
        }
    }

    const handlePinChange = (index, value) => {
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
    const handlePinBackspace = (index) => {
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
        (
            <div className="flex items-center justify-center h-screen bg-background">

                <div
                    className="w-full max-w-md space-y-6 rounded-lg border border-input bg-card p-6 shadow-lg">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Welcome to WalletXpress</h2>
                        <p className="text-muted-foreground">{fields.screen === 0 ? "Enter your mobile number to get started." : fields.screen === 1 ? "Enter your name by which people can recognise you." : fields.screen === 2 ? "Setup your pin for login" : "Enter your OTP"}</p>
                    </div>
                    <form className="space-y-4">
                        {fields.screen === 0 &&
                            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                                <Input
                                    type="tel"
                                    id="mobile"
                                    placeholder="Enter mobile number" max={10}
                                    className="max-w-[200px]" value={fields.number} onChange={(e) => e.target.value.length <= 10 && setFields({ ...fields, number: e.target.value })} />
                                <Button type="button" onClick={() => setScreen(1)}>Continue with Mobile</Button>
                            </div>
                        }
                        {
                            fields.screen === 1 &&

                            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                                <Input
                                    type="text"
                                    id="name"
                                    placeholder="Enter Your Name" max={10}
                                    className="max-w-[200px]" value={fields.name} onChange={(e) => e.target.value.length <= 30 && setFields({ ...fields, name: e.target.value })} />
                                <Button type="button" onClick={() => setScreen(2)}>Continue</Button>
                            </div>
                        }
                        {
                            fields.screen === 2 &&
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
                                            onChange={(e) => handlePinChange(index, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace") {
                                                    handlePinBackspace(index)
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
                                <Button type="button" onClick={() => signupUser()} >Setup & Next</Button>
                            </div>
                        }
                        {fields.screen === 3 &&

                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    {otp.map((_, index) => (
                                        <Input
                                            key={index}
                                            type={'text'}
                                            id={`otp-${index}`}
                                            maxLength={1}
                                            value={otp[index]}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace") {
                                                    handleOtpBackspace(index)
                                                }
                                            }}
                                            inputMode="numeric"
                                            className="w-10 text-center border border-input rounded-md bg-background" />
                                    ))}
                                </div>
                                <Button type="button" onClick={verifyUser} >Signup & Finish</Button>
                            </div>
                        }
                    </form>
                </div >
            </div >)
    );
}
