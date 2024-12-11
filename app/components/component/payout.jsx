
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { bankPayout } from "@/lib/APIs";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import Countdown from "./counter-renderer";
import { MdCopyAll } from "react-icons/md";
import Link from "next/link";

export function Payout({ data }) {
  const { user, token } = useSelector((state) => state.auth);
  const [details, setDetails] = useState({
    ifsc_code: "",
    account_number: "",
    confirm_account_number:  "",
    holder_name:"",
    amount: "",
    bank_name: "",
    error: "",
    txnId: "",
    loader: false,
    success: false
  });

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setDetails({ ...details, loader: true, error: "" });
      if (!details.account_number || !details.ifsc_code || !details.bank_name || !details.holder_name || !details.amount) {
        setDetails({ ...details, error: "All fields are required" });
        return;
      }
      if (details.account_number !== details.confirm_account_number) {
        setDetails({ ...details, error: "Account numbers do not match" });
        return;
      }
      const response = await bankPayout(details.ifsc_code, details.bank_name, details.account_number, details.amount, details.holder_name, token);
      if (response.success) {

        setDetails({ ...details, success: true, loader: false, error: "", txnId: response.txnid });
      } else {
        setDetails({ ...details, loader: false, error: response.message || "Error occurred." });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if(data){

      setDetails({...details,
        ifsc_code: data.ifsc_code,
        account_number: data.account_number,
        confirm_account_number: data.account_number,
        holder_name: data.name,
        bank_name: data.bank_name
      })
    }
  }, [])
  

  if (details.success) {
    return (
      <div className="flex flex-col items-center justify-center bg-green-500 h-screen text-white">
        <IoMdCheckmarkCircleOutline size={70} color='white' />
        <h1 className='font-bold'>Payout Successful</h1>
        <p className='font-semibold'>₹{details.amount}</p>
        <p onClick={() => copy(details.txnId)} className='text-sm flex items-center gap-2'>Transaction ID: {details.txnId.length > 20 ? details.txnId.substring(0, 20) + "..." : details.txnId} <MdCopyAll size={20} /></p>
        <p>on {new Date().toDateString()} At {new Date().toLocaleTimeString()}</p>
        <p className='text-sm font-semibold'>to BANK: {details.bank_name}</p>
        <p className='text-sm font-semibold'>{details.holder_name}</p>
        <p className='text-sm font-semibold'>******{details.account_number.substring(details.account_number.length - 4, details.account_number.length)}</p>
        <p className='text-sm font-semibold'>By {user.name}</p>
        {/* <Link href={"/home"} className='text-sm mt-16 hover:underline'>Continue to Home (<Countdown startCount={5} onComplete={() => { window.location.href = "/home" }} />)</Link> */}
      </div>
    )
  }
  return (
    (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Payout</CardTitle>
          <CardDescription>Withdraw your earnings.</CardDescription>
        </CardHeader>
        <CardContent className=" gap-2 grid grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bank-name">Bank Name</Label>
            <Input value={details.bank_name} id="bank_name" type="text" onChange={handleChange} placeholder="Enter your bank name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ifsc">IFSC</Label>
            <Input value={details.ifsc_code} id="ifsc_code" type="text" onChange={handleChange} placeholder="Enter your IFSC code" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-number">Account Number</Label>
            <Input value={details.account_number} id="account_number" onChange={handleChange} type="number" placeholder="Enter your account number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-account-number">Confirm Account Number</Label>
            <Input value={details.confirm_account_number} id="confirm_account_number" onChange={handleChange} type="number" placeholder="Confirm your account number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="holder-name">Holder Name</Label>
            <Input value={details.holder_name} id="holder_name" onChange={handleChange} type="text" placeholder="Enter account holder name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input value={details.amount} id="amount" onChange={handleChange} type="number" placeholder="Enter amount to withdraw" />
          </div>
        </CardContent>
        <p className="text-center text-red-500 text-sm">{details.error}</p>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={details.loader} className="w-full">Withdraw</Button>
        </CardFooter>
      </Card>)
  );
}
