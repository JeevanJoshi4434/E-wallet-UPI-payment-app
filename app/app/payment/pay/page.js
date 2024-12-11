"use client";

import { fetchReciever, initiatePayment, initiateUPIPayment, Pay, PayWithUPI, verifyPayment, verifyUPIPayment } from '@/lib/APIs';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import PINEntry from './PINEntry';
import PaymentEntry from './PaymentEntry';
import { useSelector } from 'react-redux';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { RxCrossCircled } from "react-icons/rx";
import { MdCopyAll } from 'react-icons/md';
import Link from 'next/link';
import { FaSpinner } from 'react-icons/fa';
import Countdown from '@/components/component/counter-renderer';


const PayViaPIN = () => {
    const searchParams = useSearchParams();

    const { user, token } = useSelector((state) => state.auth);

    const [amount, setAmount] = useState( searchParams.get('type') === "upi" ? searchParams.get('am') : searchParams.get('amount') || 0);
    const [note, setNote] = useState("");
    const amountInputRef = useRef(null); // Use useRef for input focus
    const link = "upi://pay?pa=jeetnavin@ybl&pn=Jeevan&am=500&tn=sd&cu=INR";

    const [data, setData] = useState({
        name: searchParams.get('type') === "upi" ? searchParams.get('pn') : searchParams.get('name') || "Unknown",
        number: searchParams.get('type') === "upi" ? searchParams.get('pa') : searchParams.get('tel') || null,
        amount: searchParams.get('type') === "upi" ? searchParams.get('am') : searchParams.get('amount') || null,
        payID: searchParams.get('type') === "upi" ? searchParams.get('pa') : searchParams.get('to') || null,
        TTL: searchParams.get('TTL') || null,
        date: searchParams.get('date') || null,
        type: searchParams.get('type') || null,
        loading: true,
        error: null || "",
        user: null,
        stage: 1,
        stage_1_Loader: false,
        stage_2_Loader: false,
        stage_3_Loader: false,
        txnid: "",
        transaction: null || {},
    })

    const [payButtonHidden, setpayButtonHidden] = useState(false);

    function setStage(stage) {
        setData({ ...data, stage: stage });
    }

    async function fetchUser() {
        try {
            const payID = searchParams.get('to');
            setData({ ...data, error: '' });
            if (!payID) {
                setData({ ...data, error: "Invalid PayID", loading: false });
                return;
            }

            const payIDRegex = /^[a-z]+@[0-9]+\.pk$/;

            if (!payIDRegex.test(payID)) {
                setData({ ...data, error: "Invalid PayID #2", loading: false });
                return;
            }

            const response = await fetchReciever(payID);

            if (response.success) {
                setData({ ...data, ...response.data, loading: false, user: response.data.user });
                amountInputRef.current?.focus();
            }

            if (response.error) {
                setData({ ...data, error: response.message || "Something went wrong", loading: false });
            }
        } catch (error) {
            // Check if error has a custom message or provide a default message
            setData({
                ...data,
                error: error.message || "Something went wrong",
                loading: false
            });
        }
    }


    async function initiatePay() {
        try {
            setData({ ...data, stage_1_Loader: true, error: '' });
            const response = data.type === "upi" ? await initiateUPIPayment( data.name || "User", data.payID, amount, token) : await initiatePayment(user.id, data.user.id, amount, token, note);
                console.log(response);
            if (response.success) {
                setpayButtonHidden(true);
                setTimeout(() => {
                    setData({ ...data, stage: 2, stage_2_Loader: false, stage_1_Loader: false, stage_3_Loader: false, txnid: response.txnid, error: '' });
                }, 1000);
            }
            if (response.error) {
                setData({ ...data, error: response.message || "Something went wrong", stage_1_Loader: false, stage_2_Loader: false, stage_3_Loader: false });
            }
        } catch (error) {
            setData({
                ...data,
                error: error.message || "Something went wrong",
                loading: false,
            })
        }
    }

    async function verifyPIN(pin) {
        try {
            setData({ ...data, stage_2_Loader: true });
            const response = data.type === "upi" ? await verifyUPIPayment(pin, data.txnid, token) : await verifyPayment(user.id, pin, data.txnid, token);
            
            if (response.success) {
                setData({ ...data, stage: 3, stage_3_Loader: true, stage_1_Loader: false, stage_2_Loader: false, error: '', txnid: response.txnid });
                completePayment();

            }
            if (response.error) {
                setData({ ...data, error: response.message || "Something went wrong", stage_1_Loader: false, stage_2_Loader: false, stage_3_Loader: false });
            }
        } catch (error) {
            console.log(error);
            setData({
                ...data,
                error: error.message || "Something went wrong",
                stage_2_Loader: false,
            })
        }
    }

    async function completePayment() {
        try {
            const response = data.type === "upi" ? await PayWithUPI(data.txnid, token) : await Pay(user.id, data.user.id, amount, data.txnid, token);
           
            if (response.success) {
                setData({ ...data, stage: 3, stage_3_Loader: false, stage_2_Loader: false, error: '', txnid: response.txnid, transaction: response.transaction });
            }
            if (response.error) {
                setData({ ...data, error: response.message || "Something went wrong", stage_1_Loader: false, stage_2_Loader: false, stage_3_Loader: false });
            }
        } catch (error) {
            setData({
                ...data,
                error: error.message || "Something went wrong",
                stage_3_Loader: false,
            })
        }
    }

    function copy(text) {
        navigator.clipboard.writeText(text);
    }


    useEffect(() => {
        if (searchParams.get('type') === "upi") {
            const user = {
                name: searchParams.get('pn') || "Unknown",
                number: null,
                payid: searchParams.get('pa')
            }
            setData({...data, user: user, loading:false});
        } else {

            fetchUser();
        }
    }, [])

    // useEffect(() => {
    //     const handleBeforeUnload = (event) => {
    //         // Customize the message shown to the user (note: modern browsers may not show this text)
    //         const confirmationMessage = 'You have not finished your payment. Are you sure you want to leave this page?';
    //         event.returnValue = confirmationMessage; // For Chrome
    //         return confirmationMessage; // For Firefox
    //     };

    //     // Add event listener
    //     window.addEventListener('beforeunload', handleBeforeUnload);

    //     // Cleanup event listener on component unmount
    //     return () => {
    //         window.removeEventListener('beforeunload', handleBeforeUnload);
    //     };
    // }, []);


    return (
        <div className={`flex flex-col relative items-center h-screen p-2 ${data.stage === 3 ? data.stage_3_Loader ? " bg-white" : data.error.length > 0 ? "bg-red-700 text-white" : "bg-green-600 text-white" : ''}`}>
            {
                data.stage === 1 ?
                    <PaymentEntry payButtonStatus={payButtonHidden} note={note} setNote={setNote} amount={amount} initiatePayment={initiatePay} setAmount={setAmount} amountInputRef={amountInputRef} data={data} stage={data.stage} setStage={setStage} />
                    : data.stage === 2 ?
                        <PINEntry verifyPIN={verifyPIN} setStage={setStage} stage={data.stage} data={data} />
                        :
                        <div className={`flex flex-col h-full w-full rounded-lg items-center justify-center gap-2`}>
                            {
                                data.stage === 3 &&
                                <>
                                    {
                                        data.stage_3_Loader ?
                                            <>
                                                <FaSpinner className='spin' size={100} color='black' />
                                                <p className='text-sm font-semibold mt-3'>Processing Payment, Please wait...</p>
                                            </>
                                            :
                                            data.error.length > 0 ?
                                                <>
                                                    {data.user &&
                                                        <>
                                                            <RxCrossCircled color='white' size={70} />
                                                            <h1 className='font-bold'>Payment Failed</h1>
                                                            <p className='font-semibold'>{data.error}</p>
                                                            <p className='text-sm font-semibold'>to {data.user.name}</p>
                                                            <p className='text-sm font-semibold'>{data.user.payid}</p>
                                                            <p className='text-sm font-semibold'>By {user.name}</p>
                                                            <p className='text-sm font-semibold'>{user.payid}</p>
                                                            <Link href={"/home"} className='text-sm mt-16 hover:underline'>Continue to Home (<Countdown startCount={5} onComplete={() => { window.location.href = "/home" }} />)</Link>
                                                        </>
                                                    }
                                                </>
                                                :
                                                <>{
                                                    data.transaction && data.user &&
                                                    <>
                                                        <IoMdCheckmarkCircleOutline size={70} color='white' />
                                                        <h1 className='font-bold'>Payment Successful</h1>
                                                        <p className='font-semibold'>₹{amount}</p>
                                                        <p onClick={() => copy(data.txnid)} className='text-sm flex items-center gap-2'>Transaction ID: {data.txnid.length > 20 ? data.txnid.substring(0, 20) + "..." : data.txnid} <MdCopyAll size={20} /></p>
                                                        <p>on {new Date(data.transaction.paid_at).toDateString()} At {new Date(data.transaction.paid_at).toLocaleTimeString()}</p>
                                                        <p className='text-sm font-semibold'>to {data.user.name}</p>
                                                        <p className='text-sm font-semibold'>{data.user.payid}</p>
                                                        <p className='text-sm font-semibold'>By {user.name}</p>
                                                        <p className='text-sm font-semibold'>{user.payid}</p>
                                                        <Link href={"/home"} className='text-sm mt-16 hover:underline'>Continue to Home (<Countdown startCount={5} onComplete={() => { window.location.href = "/home" }} />)</Link>
                                                    </>
                                                }
                                                </>
                                    }
                                </>
                            }
                        </div>}
        </div>
    )
}

export default PayViaPIN