"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react";
import { fetchUser, getUser, getUserPaymentHistory } from "@/lib/APIs";
import { useSelector } from "react-redux";
import { ArrowRightCircle, MoveLeft } from "lucide-react";

export function UserPayment({ id }) {

  const { token, user } = useSelector((state) => state.auth);

  const [information, setInformation] = useState({
    user: null | {},
    paymentHistory: [],
    paymentHistory_loader: true,
    paymentHistory_error: '',
    amount: 0
  });

  function handleAmount(e) {
    setInformation({ ...information, amount: e.target.value })
  }

  function checkout(){
    const amount = information.amount;
    if(!user){
      throw new Error("User not found");
    }
    const url = `/payment/pay?to=${information.user.payid}&name=${information.user.name}&amount=${amount}&tel=${information.user.number}`;
    window.location.href = url;
  }

  async function fetchPaymentHistory() {
    try {
      const response = await getUser(token, id);
      if (response.success) {
        const paymentResponse = await getUserPaymentHistory(token, id);
        if (paymentResponse.success) {
          setInformation({ ...information, user: response.user, paymentHistory: paymentResponse.history, paymentHistory_loader: false });

        }
      } else {
        setInformation({ ...information, paymentHistory_error: response.message, paymentHistory_loader: false });
      }
      if (response.error) {
        setInformation({ ...information, paymentHistory_error: response.message, paymentHistory_loader: false });
      }
    } catch (error) {

    }
  }


  useEffect(() => {
    if (information.paymentHistory.length > 0) {
      const timer = setTimeout(() => {
        // scroll scrollableDiv to end on load
        const scrollableDiv = document.getElementById("scrollableDiv");
        scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [information.paymentHistory]);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  return (
    (
      <div className="flex flex-col h-screen">
        <header
          className="bg-secondary text-black flex items-center gap-4 px-4 py-3 shadow">
          <MoveLeft className="h-4 w-4 cursor-pointer" onClick={() => window.history.back()} />
          <Avatar className="h-8 w-8 border">
            <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
            <AvatarFallback>Loading</AvatarFallback>
          </Avatar>
          <div className="font-medium">{information.user?.name}</div>
        </header>
        <div id="scrollableDiv" className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          <p className="w-full items-center py-2 justify-center flex text-xs text-muted-foreground">Joined on {new Date(information.user?.created_at).toDateString()}</p>
          {
            information.paymentHistory_loader &&
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          }
          {
            information.paymentHistory_error.length > 0 &&
            <div className="flex items-center justify-center h-40">
              <p className="text-red-600">{information.paymentHistory_error}</p>
            </div>
          }
          {
            information.paymentHistory?.length > 0 &&
            information.paymentHistory.map((item, index) => {

              if (item.rId === user.id && item.success) {
                return (
                  <LeftChat key={index} note={item.note} timestamp={new Date(item?.paid_at)} amount={item.amount} />
                )
              } else {
                const url = `/payment/pay?to=${information.user.payid}&name=${information.user.name}&amount=${item.amount}&tel=${information.user.number}`;
                return (
                  <RightChat buttonURL={url} key={index} failed={!item.success} note={item.note} timestamp={new Date(item?.paid_at)} amount={item.amount} />
                )
              }
            })
          }
        </div>
        <div className="border-t p-3">
          <form className="flex items-center gap-2">
            <Input onChange={handleAmount} value={information.amount > 0 && information.amount} placeholder="Type Amount ₹" type="number" className="flex-1 outline-none " autoComplete="off" />
            <Button onClick={checkout} disabled={information.amount <= 0} type="button" size="icon">
              <SendIcon className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>)
  );
}

const LeftChat = ({ note = "", timestamp = new Date(), amount = "" }) => {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8 border">
        <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div className="bg-green-500 shadow-md text-white rounded-lg p-3 max-w-[75%]">
        <p>Amount: ₹{amount} Recieved Successfully</p>
        {note&&
          <div className="grid grid-cols-1">
            <p className="text-xs font-semibold text-white">Note</p>
            <p className="text-xs text-white">{note}</p>
          </div>
        }
        <div className="text-xs text-primary-foreground/80 mt-1">{timestamp.toUTCString()}</div>
      </div>
    </div>
  )
}

const RightChat = ({ buttonURL = "", failed = false, note = "", timestamp = new Date(), amount = "" }) => {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className={` ${failed ? 'bg-red-700' : 'bg-green-700'} text-primary-foreground shadow-inner rounded-lg p-3 max-w-[75%]`}>
        <p>Amount: ₹{amount} {!failed && "Sent Successfully"}</p>
        {note &&
          <div className="grid grid-cols-1">
            <p className="text-xs font-semibold text-white">Note</p>
            <p className="text-xs text-white">{note}</p>
          </div>
        }
        <div className="text-xs text-primary-foreground/80 mt-1">{timestamp.toUTCString()}</div>
        {
          failed &&
          <button onClick={() => window.location.href = buttonURL} className="py-2 my-3 px-4 w-full flex items-center justify-between bg-red-500 text-white border rounded-full">
            Retry Payment <ArrowRightCircle className="h-4 w-4" />
          </button>
        }
      </div>
      <Avatar className="h-8 w-8 border">
        <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
        <AvatarFallback>User</AvatarFallback>
      </Avatar>
    </div>
  )
}

function SendIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>)
  );
}
