"use client";

import React, { useState } from 'react'
import { FaSpinner } from 'react-icons/fa';
import { MdOutlineErrorOutline } from 'react-icons/md';
import { useSelector } from 'react-redux';

const PaymentEntry = ({ amount, setAmount = () => { }, stage = 1, setStage = () => { }, data, amountInputRef, initiatePayment, setNote, note="", payButtonStatus=false }) => {
    const [showPaymentPanel, setShowPaymentPanel] = useState(false); // New state for panel visibility
    const {user} = useSelector((state)=>state.auth);
    const handleContinueToPay = () => {
        setShowPaymentPanel(true); // Show the payment panel when the user clicks "Continue to Pay"
    };

    return (
        <>
            <h1 className='text-xl text-center font-semibold'>
                Payment Karo
                <br />
                <p className="text-xs text-muted-foreground ">A simplest way to transfer money without any hassle.</p>
            </h1>
            <div className='h-full w-full items-center text-center gap-4 flex flex-col justify-center'>
                {data.error && <p className='text-red-500 text-sm flex flex-col items-center justify-center'><MdOutlineErrorOutline size={24} /><br />{data.error}</p>}
                {!data.loading && data.user ?

                    <p className='text-lg text-center'>
                        Paying To
                        <span className='mx-1 font-semibold'>
                            {data.user.name}
                        </span>
                        <br />
                        <span className='text-xs'>Phone Number: {data.user.number}</span>
                        <br />
                        <span className='text-xs'>PayID: {data.user.payid}</span>
                    </p>
                    :
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex animate-pulse items-center justify-center gap-2">
                            <div className="h-3 w-48 rounded-md bg-slate-200"></div>
                        </div>
                        <div className="flex mt-3 animate-pulse items-center justify-center gap-2">
                            <div className="h-2 w-24 rounded-md bg-slate-200"></div>
                            <div className="h-2 w-16 rounded-md bg-slate-200"></div>
                        </div>
                        <div className="flex animate-pulse items-center justify-center gap-2">
                            <div className="h-2 w-48 rounded-md bg-slate-200"></div>
                        </div>
                    </div>
                }
                {
                    data.loading ?
                        <div className="flex flex-col items-center mt-5 justify-center gap-2">
                            <div className="flex animate-pulse items-center justify-center gap-2">
                                <div className="h-4 w-24 rounded-md bg-slate-200"></div>
                            </div>
                            <div className="flex mt-3 animate-pulse items-center justify-center gap-2">
                                ₹<div className="h-6 w-48 rounded-md bg-slate-200"></div>
                            </div>
                        </div>
                        :
                        <>
                            {
                                !data.amount ?
                                    <>
                                        <h2 className='text-lg'>Enter Payment Amount</h2>
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
                                                ref={amountInputRef}
                                                value={amount}
                                                min={1} />
                                        </div>
                                        <textarea onChange={(e)=>setNote(e.target.value)} value={note} name="note" placeholder='Add Note' className='w-[250px] outline-none p-1 border rounded-md border-input'></textarea>
                                        <div className=' min-w-[240px] w-[280px] p-1 flex items-center flex-wrap gap-2'>
                                            <span onClick={(e)=>setNote(`Happy Birthday ${data.user.name}!`)} className=' cursor-pointer text-sm p-2 border border-input rounded-full font-semibold text-gray-500'>Happy Birthday {data.user.name}!</span>
                                            <span onClick={(e)=>setNote("PS5 le lena")} className=' cursor-pointer text-sm p-2 border border-input rounded-full font-semibold text-gray-500'>PS5 le lena</span>
                                            <span onClick={(e)=>setNote("Party from my side!")} className=' cursor-pointer text-sm p-2 border border-input rounded-full font-semibold text-gray-500'>Party from my side!</span>
                                            <span onClick={(e)=>setNote("Enjoy your day ;)")} className=' cursor-pointer text-sm p-2 border border-input rounded-full font-semibold text-gray-500'>Enjoy your day ;)</span>
                                            <span onClick={(e)=>setNote("Have some cookies")} className=' cursor-pointer text-sm p-2 border border-input rounded-full font-semibold text-gray-500'>Have some cookies</span>
                                        </div>
                                    </>
                                    :
                                    <>
                                        <h2 className='text-lg'>Amount To Pay</h2>
                                        <div className='border-b border-input p-2 '>
                                            <span className='text-xl font-semibold mr-2'>₹</span>
                                            <input
                                                placeholder='Amount'
                                                required
                                                disabled
                                                type="number"
                                                className='text-xl outline-0'
                                                inputMode='decimal'
                                                value={amount}
                                                min={1} />
                                        </div>
                                        <textarea onChange={(e)=>setNote(e.target.value)} value={note} name="note" placeholder='Add Note' className='w-[250px] outline-none p-1 border rounded-md border-input'></textarea>
                                        <div className=' min-w-[240px] w-[280px] p-1 flex items-center flex-wrap gap-2'>
                                            <span onClick={(e)=>setNote(`Happy Birthday ${data.user.name}!`)} className=' cursor-pointer text-sm p-2 border border-input rounded-full font-semibold text-gray-500'>Happy Birthday {data.user.name}!</span>
                                            <span onClick={(e)=>setNote("PS5 le lena")} className=' cursor-pointer text-sm p-2 border border-input rounded-full font-semibold text-gray-500'>PS5 le lena</span>
                                            <span onClick={(e)=>setNote("Party from my side!")} className=' cursor-pointer text-sm p-2 border border-input rounded-full font-semibold text-gray-500'>Party from my side!</span>
                                            <span onClick={(e)=>setNote("Enjoy your day ;)")} className=' cursor-pointer text-sm p-2 border border-input rounded-full font-semibold text-gray-500'>Enjoy your day ;)</span>
                                            <span onClick={(e)=>setNote("Have some cookies")} className=' cursor-pointer text-sm p-2 border border-input rounded-full font-semibold text-gray-500'>Have some cookies</span>
                                        </div> 
                                    </>
                            }
                        </>
                }
                {
                    amount > 0 &&
                    <button onClick={handleContinueToPay} className=' min-w-[240px] w-[280px] rounded-full bg-green-600 text-white font-semibold p-2'>{!showPaymentPanel && 'Continue To Pay'} ₹{amount}</button>
                }
            </div>
            <span onClick={() => setShowPaymentPanel(false)} className={`absolute bottom-0 ${!showPaymentPanel ? 'h-0' : 'h-screen'}    w-full opacity-25 z-10`}></span>
            <div
                className={`absolute bottom-0 max-w-[400px] rounded-t-lg bg-[#313131] z-30 text-white w-full transition-all duration-500 ${showPaymentPanel ? 'h-48' : 'h-0 '
                    }`}
            >
                <div className='flex items-center justify-center p-3 flex-col gap-2'>
                    <button onClick={initiatePayment} disabled={data.stage_1_Loader} className={` ${!showPaymentPanel && 'hidden'} transition-all duration-500  ${payButtonStatus ? 'w-0' : 'w-full'} flex items-center text-center justify-center rounded-full text-black bg-white hover:bg-gray-100 font-semibold p-2 `}>{!data.stage_1_Loader ? `${!payButtonStatus && "Pay Now"}` : <FaSpinner className='spin' />}</button>
                    {data.error && <p className='text-red-500 text-xs w-full justify-center flex items-center gap-2'> <MdOutlineErrorOutline /> {data.error}</p>}
                    { !payButtonStatus && <button onClick={() => setShowPaymentPanel(false)} className={` ${!showPaymentPanel && 'hidden'} w-full rounded-full transition-all duration-500  text-white bg-red-500 font-semibold p-2`}>Cancel</button>}
                    {/* <p className='absolute text-lg font-bold bottom-5 left-2'>{user.name} | Payment Karo</p> */}
                    {/* <p className='absolute text-xs bottom-1 right-2 flex items-center'>Payment Karo<sup>&copy;</sup>{new Date().getFullYear()} </p> */}
                </div>
            </div>
        </>
    )
}

export default PaymentEntry