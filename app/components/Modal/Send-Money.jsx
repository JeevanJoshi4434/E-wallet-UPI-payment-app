import React, { useState } from 'react'
import { Button } from '../ui/button'
import { FaSpinner } from 'react-icons/fa';
import { fetchNumber, fetchReciever } from '@/lib/APIs';
import { Separator } from '@radix-ui/react-dropdown-menu';

const SendMoney = () => {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const fetchUser = async () => {
        try {
            setError("");

            setLoading(true);
            const payIDRegex = /^[a-z]+@[0-9]+\.pk$/;
            const numberRegex = /^[0-9]+$/;
            let payID = false, number = false;
            if (payIDRegex.test(input)) {
                payID = true
            } else if (numberRegex.test(input)) {
                if (input.length === 10) {
                    number = true
                } else {
                    setError("Number must be 10 digits");
                    setLoading(false);
                    return;
                }

            } else {
                setError("Invalid Input");
                setLoading(false);
                return;
            }
            if (payID) {
                const response = await fetchReciever(input);

                if (response.success) {
                    const data = response.data;
                    const user = data.user;
                    window.location.href = `/payment/pay?to=${user.payid}&name=${user.name}&tel=${user.number}`
                }

                if (response.error) {
                    setError(response.message || "Something went wrong");
                }
            }
            else if (number) {
                const response = await fetchNumber(input);

                if (response.success) {
                    const data = response.data;
                    const user = data.user;
                    window.location.href = `/payment/pay?to=${user.payid}&name=${user.name}&tel=${user.number}`
                }

                if (response.error) {
                    setError(response.message || "Something went wrong");
                }
            }
        } catch (e) {

        }finally{
            setLoading(false);
        }
    }
    return (
        <div className="w-72 ">
            <h1 className=" font-semibold text-lg">Send Money</h1>
            <p className=" text-xs">Enter payID/Number</p>
            <input value={input} onChange={(e) => { setInput(e.target.value) }} className="border border-input rounded-md my-2 w-full p-2" placeholder="Enter PayID or Mobile Number" />
            <p className='text-red-500 my-1 text-xs'>{error}</p>
            <Button disabled={loading} onClick={fetchUser}>{loading ? <FaSpinner className='spin' /> : 'Pay'}</Button>
            {/* <Separator />
            <div className='flex flex-col items-center justify-center w-full'>
                <p className='text-xs font-semibold'>or</p>
                <p>Scan Now</p>
            </div> */}
        </div>
    )
}

export default SendMoney