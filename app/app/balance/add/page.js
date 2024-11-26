"use client";

import Countdown from '@/components/component/counter-renderer';
import PaymentButton from '@/components/component/PaymentButton';
import Link from 'next/link';
import React, { useState } from 'react'
import { FaSpinner } from 'react-icons/fa';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { MdOutlineErrorOutline } from 'react-icons/md';
import { useSelector } from 'react-redux';

const Page = () => {
    const [showPaymentPanel, setShowPaymentPanel] = useState(false); // New state for panel visibility
    const { user, token } = useSelector((state) => state.auth);
    const handleContinueToPay = () => {
        setShowPaymentPanel(true); // Show the payment panel when the user clicks "Continue to Pay"
    };
    const [data, setData] = useState({
        error: "",
        loading: false,
        user: user,
        success: false
    })
    function setSuccess(type) {
        setData({ ...data, success: type });
    }
    const [payButtonStatus, setPayButtonStatus] = useState(false);
    const [amount, setAmount] = useState(0.00);
    if (!data.success)
        return (
            <main className='h-screen py-4 px-2'>
                <h1 className='text-xl text-center font-semibold'>
                    Payment Karo
                    <br />
                    <p className="text-xs text-muted-foreground ">A simplest way to transfer money without any hassle.</p>
                </h1>
                <div className='h-full w-full items-center text-center gap-4 flex flex-col justify-center'>
                    {data.error && <p className='text-red-500 text-sm flex flex-col items-center justify-center'><MdOutlineErrorOutline size={24} /><br />{data.error}</p>}

                    <p className='text-lg text-center'>
                        Recharge with
                        <span className='mx-1 font-semibold'>
                            Razorpay
                        </span>
                        <br />
                        <span className='text-xs'>Recharge your wallet with Razorpay</span>
                        <br />
                        <span className='text-xs'>End to end secure payment</span>
                    </p>

                    <h2 className='text-lg'>Enter Recharge Amount</h2>
                    <div className='border-b border-input p-2 '>
                        <span className='text-xl font-semibold mr-2'>₹</span>
                        <input
                            placeholder='Enter Amount'
                            required
                            type="number"
                            className='text-xl outline-0 amount'
                            inputMode='decimal'
                            onChange={(e) => {
                                let value = e.target.value;
                                if (/^\d*\.?\d{0,2}$/.test(value)) {  // Allow up to 2 decimal places
                                    setAmount(value);
                                }
                            }}
                            value={amount}
                            min={1} />
                    </div>
                    {
                        amount >= 1.00 &&
                        <button onClick={handleContinueToPay} className=' min-w-[240px] w-[280px] rounded-full bg-green-600 text-white font-semibold p-2'>{!showPaymentPanel && 'Continue To Recharge'} ₹{amount}</button>
                    }
                </div>
                <span onClick={() => setShowPaymentPanel(false)} className={`absolute bottom-0 ${!showPaymentPanel ? 'h-0' : 'h-screen'}    w-full opacity-25 z-10`}></span>
                <div
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 max-w-[400px] rounded-t-lg bg-[#313131] z-30 text-white w-full transition-all duration-500 ${showPaymentPanel ? 'h-48' : 'h-0 '
                        }`}
                >
                    <div className='flex items-center justify-center p-3 flex-col gap-2'>
                        <PaymentButton setSuccess={setSuccess} showPaymentPanel={showPaymentPanel} payButtonStatus={payButtonStatus} setPayButtonStatus={setPayButtonStatus} amount={amount} />
                        {data.error && <p className='text-red-500 text-xs w-full justify-center flex items-center gap-2'> <MdOutlineErrorOutline /> {data.error}</p>}
                        {!payButtonStatus && <button onClick={() => setShowPaymentPanel(false)} className={` ${!showPaymentPanel && 'hidden'} w-full rounded-full transition-all duration-500  text-white bg-red-500 font-semibold p-2`}>Cancel</button>}
                        {/* <p className='absolute text-lg font-bold bottom-5 left-2'>{user.name} | Payment Karo</p> */}
                        {/* <p className='absolute text-xs bottom-1 right-2 flex items-center'>Payment Karo<sup>&copy;</sup>{new Date().getFullYear()} </p> */}
                    </div>
                </div>
            </main>
        )
    else {

        return (
            <main className='h-screen flex flex-col items-center justify-center text-white bg-green-500'>
                <IoMdCheckmarkCircleOutline size={70} color='white' />
                <h1 className='font-bold'>Recharge Successful</h1>
                <p className='font-semibold'>₹{amount}</p>
                <p className='text-sm font-semibold'>{user.name}</p>
                <p className='text-sm font-semibold'>{data.user.payid}</p>
                <p className='text-sm font-semibold'>Thanks for using Payment Karo.</p>
                <Link href={"/home"} className='text-sm mt-16 hover:underline'>Continue to Home (<Countdown startCount={5} onComplete={() => { window.location.href = "/home" }} />)</Link>
            </main>
        )
    }
}

export default Page