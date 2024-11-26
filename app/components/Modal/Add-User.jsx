import React, { useState } from 'react'
import { Button } from '../ui/button'
import { FaSpinner } from 'react-icons/fa';
import { addConnection, fetchNumber, fetchReciever } from '@/lib/APIs';
import { useSelector } from 'react-redux';
import { useToast } from '@/context/ToastContext';



const AddUser = ({ setConnections }) => {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null || {});
    const { addToast } = useToast();
    const { token } = useSelector((state) => state.auth);

    const addUser = async () => {
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
                    setUser(user);
                    const Add = await addConnection(token, user.id);
                    if (Add.success) {
                        setConnections(user);
                        addToast("Connection Added Successfully.", 2000, 'top-right', 'success');
                    }
                    if (Add.error) {
                        console.log(Add);
                        addToast(Add.status === 409 ? "User Already Added" : "Some error happened! please try again.", 2000, 'top-right', 'error');

                    }
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
                    setUser(user);

                    const Add = await addConnection(token, user.id);
                    if (Add.success) {
                        setConnections(user);
                        addToast("Connection Added Successfully.", 2000, 'top-right', 'success');
                    }
                    if (Add.error) {
                        addToast("Some error happened! please try again.", 2000, 'top-right', 'error');

                    }
                }

                if (response.error) {
                    setError(response.message || "Something went wrong");
                }
            }
        } catch (e) {

        } finally {
            setLoading(false);
        }
    }
    return (
        <div className=" w-72 ">
            <h1 className=" font-semibold text-lg">Add Quick User</h1>
            <p className=" text-xs">Enter payID/Number</p>
            <input value={input} onChange={(e) => { setInput(e.target.value) }} className="border border-input rounded-md my-2 w-full p-2" placeholder="Enter PayID or Mobile Number" />
            <p className='text-red-500 my-1 text-xs'>{error}</p>
            <Button disabled={loading} onClick={addUser}>{loading ? <FaSpinner className='spin' /> : 'Add'}</Button>
        </div>
    )
}

export default AddUser