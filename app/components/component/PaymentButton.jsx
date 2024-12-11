// \src\Components\PaymentButton.jsx
"use client";

import { FaSpinner } from "react-icons/fa";
import { useRazorpay } from "react-razorpay";
import { useSelector } from "react-redux";

export default function PaymentButton({ amount, setSuccess, showPaymentPanel, payButtonStatus, setPayButtonStatus }) {
  const { error, isLoading, Razorpay } = useRazorpay();
  const { user, token } = useSelector((state) => state.auth);

  const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const handlePayment = async () => {
    try {
      setPayButtonStatus(true);
      // Make the API call to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVICE_PAYMENT}/api/v1/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amount * 100 }),
      });

      const order = await response.json();
      console.log(order)
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "WalletXpress",
        description: `Recharge your account with Razorpay, pay now (${order.currency} ${order.amount})`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVICE_PAYMENT}/api/v1/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },

              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const data = await res.json();
            if (data.success) {
              setSuccess(true);
            }
          } catch (err) {
            // Add onPaymentUnSuccessfull function here
            alert("Payment failed: " + err.message);
          }
        },
        prefill: {
          name: user.name, 
          contact: user.number,
        },
        notes: {
          address: "EraPay Corporate Office",
        },
        theme: {
          // you can change the gateway color from here according to your
          // application theme
          color: "#3399cc",
        },
      };
      const rzpay = new Razorpay(options);
      // this will open razorpay window for take the payment in the frontend
      // under the hood it use inbuild javascript windows api 
      rzpay.open(options);
    } catch (err) {
    } finally {
      setPayButtonStatus(false);
    }
  };

  return (
    <>
      <button onClick={handlePayment} className={` ${!showPaymentPanel && 'hidden'} transition-all duration-500  ${payButtonStatus ? 'w-0' : 'w-full'} flex items-center text-center justify-center rounded-full text-black bg-white hover:bg-gray-100 font-semibold p-2 `}>{!isLoading ? `${!payButtonStatus ? "Recharge Now" : ""}` : <FaSpinner className='spin' />}</button>
    </>
  );
}