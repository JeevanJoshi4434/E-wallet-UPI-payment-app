"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash, FaSpinner } from 'react-icons/fa';
import { MdOutlineErrorOutline } from 'react-icons/md';
import { SiContactlesspayment } from 'react-icons/si';

const PINEntry = ({stage=2, setStage=()=>{}, data, verifyPIN=()=>{}}) => {
    const [pin, setPIN] = useState(["", "", "", ""]);
    const [fields, setFields] = useState({
        password: 'password',
        error: ''
    });
    

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
    return (
        <div className='absolute top-0 h-screen bg-[#212121] w-full z-50'>
            <form className='flex items-center justify-center flex-col h-screen'>
                <div className="space-y-2">
                    <div className='w-full items-center justify-center flex'>
                        <SiContactlesspayment color='white' size={40} />
                    </div>
                    <h1 style={{ color: "white" }} className='w-full text-center text-2xl text-white font-semibold'>Payment Karo</h1>
                    <h4 style={{ color: "white" }} className='text-white text-xs w-full text-center'>A cashless way to pay.</h4>
                    <p style={{ color: "white" }} className="text-sm text-white text-center w-full">Enter your PIN to Pay</p>
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
                    {data.error && <p className='text-red-500 text-xs w-full text-start'> <MdOutlineErrorOutline /> {data.error}</p>}
                    <Button type="button" className="w-full rounded-full bg-green-700" disabled={pin.join("").length !== 4} onClick={()=>{verifyPIN(pin.join(""))}} >{!data.stage_2_Loader ? 'Pay' :<FaSpinner className='spin' />}</Button>
                </div>
            </form>
        </div>
    )
}

export default PINEntry