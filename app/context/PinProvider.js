// components/PinProvider.js
"use client";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { useSelector } from 'react-redux';
import { CiLock } from "react-icons/ci";
import { SiProgress } from 'react-icons/si';
import { LoaderIcon } from 'lucide-react';

const PinContext = createContext();

export function PinProvider({ children }) {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const [isVerified, setIsVerified] = useState(false);
    const [pin, setPIN] = useState(["", "", "", ""]);
    const [Loader, setLoader] = useState(true);
    const [fields, setFields] = useState({
        password: 'password',
        error: ''
    });

    // Initialize PIN verification
    const verifyPIN = async (pin) => {
        try {
            if (!user) {
                window.location.href = '/login';
            }
            setFields({ ...fields, error: '' });
            const response = await fetch('/api/verify_pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin, pin2: user?.pin })
            });
            const data = await response.json();
            setIsVerified(data.success);
            if (data.success) {
                sessionStorage.setItem('verified', 'true');
                setPIN(["", "", "", ""]);
                if (window.location.pathname === '/signup' || window.location.pathname === '/login') {
                    window.location.href = '/home';
                }
            } else {
                setFields({ ...fields, error: 'Invalid PIN' });
                setPIN(["", "", "", ""]);
            }
        } catch (error) {
            setFields({ ...fields, error: 'Invalid PIN' });
            setPIN(["", "", "", ""]);
            console.error("Error verifying PIN:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await verifyPIN(pin.join(""));
    };

    const handlePinChange = (index, value) => {
        setFields({ ...fields, error: '' });
        const newPIN = [...pin];
        newPIN[index] = value;
        setPIN(newPIN);
        if (value.length === 1) {
            const nextInput = document.querySelector(`#pin-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    const handlePinBackspace = (index) => {
        setFields({ ...fields, error: '' });
        const newPIN = [...pin];
        newPIN[index] = "";
        setPIN(newPIN);
        if (index > 0) {
            const prevInput = document.querySelector(`#pin-${index - 1}`);
            if (prevInput) {
                prevInput.focus();
            }
        }
    };

    // Check session on mount
    useEffect(() => {
        const sessionActive = sessionStorage.getItem('verified');
        if (JSON.parse(sessionActive) === true) {
            setIsVerified(true);
            setLoader(false);
        } else {
            setLoader(false);
        }
    }, []);

    // Auto-lock on window blur
    const handleWindowBlur = useCallback(() => {
        // if (process.env.NEXT_PUBLIC_PRODUCTION === "PRODUCTION" && window.location.pathname !== '/balance/add') {
            // setIsVerified(false);
            // sessionStorage.removeItem('verified');
        // }
    }, []);

    useEffect(() => {
        window.addEventListener('blur', handleWindowBlur);
        return () => {
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [handleWindowBlur]);
    if (Loader) {
        return (
            <div className="pin-prompt bg-black h-screen items-center justify-center flex flex-col">
                <LoaderIcon className='spin' color='white' size={30} />
                <h1 style={{ color: "white" }} className='w-full text-center text-2xl text-white font-semibold'>WalletXpress Loading...</h1>
            </div>
        )
    } else
        return (
            <PinContext.Provider value={{ isVerified, setIsVerified, verifyPIN }}>
                {(isVerified || !isAuthenticated || window.location.pathname === '/') ? (
                    children
                ) : (
                    <div className="pin-prompt bg-black h-screen items-center justify-center flex flex-col">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <div className='w-full items-center justify-center flex'>
                                    <CiLock color='white' size={30} />
                                </div>
                                <h1 style={{ color: "white" }} className='w-full text-center text-2xl text-white font-semibold'>WalletXpress Locked</h1>
                                <h4 style={{ color: "white" }} className='text-white text-xs'>The world is so risky <br /> And we care about your privacy!</h4>
                                <p style={{ color: "white" }} className="text-sm text-white">Enter your PIN</p>
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
                                                    handlePinBackspace(index);
                                                }
                                            }}
                                            inputMode="numeric"
                                            className="w-10 text-center border border-input rounded-md bg-background" />
                                    ))}
                                    <div
                                        className="w-10 text-center rounded-md bg-background cursor-pointer flex items-center justify-center"
                                        onClick={() => setFields({ ...fields, password: fields.password === "password" ? "text" : "password" })}
                                    >
                                        {fields.password === "text" ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                                    </div>
                                </div>
                                <p className='text-red-500 text-xs'>{fields.error}</p>
                                <Button type="button" disabled={pin.join("").length !== 4} onClick={() => verifyPIN(pin.join(""))}>Login</Button>
                            </div>
                        </form>
                    </div>
                )}
            </PinContext.Provider>
        );
}

export const usePin = () => useContext(PinContext);
