import { getPaymentHistory } from "@/lib/APIs";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { HistoryLoader } from "./payment-homepage";
import { ArrowLeft, ArrowRight, MoveRight } from "lucide-react";


export function PaymentsHistory() {
  const { user, token } = useSelector((state) => state.auth);

  const [information, setInformation] = useState({
    paymentHistory: [],
    paymentHistory_loader: true,
    paymentHistory_error: '',
  });
  const [page, setPage] = useState(0); // Track the current page
  const limit = 10; // Number of items to fetch per page
  const [hasMore, setHasMore] = useState(true); // Track if there is more data to fetch

  // Function to fetch payment history
  async function fetchPaymentHistory(page, limit) {
    try {
      const response = await getPaymentHistory(token, page, limit);
      if (response.success) {
        return { history: response.history, hasMore: response.history.length === limit };
      }
      if (response.error) {
        throw new Error(response.message);
      }
    } catch (error) {
      throw error;
    }
  }

  // Function to handle fetching and appending data
  async function fetchDetails() {
    setInformation((prev) => ({ ...prev, paymentHistory_loader: true }));
    try {
      const { history, hasMore } = await fetchPaymentHistory(page, limit);
      setInformation((prev) => ({
        ...prev,
        paymentHistory: [...prev.paymentHistory, ...history],
        paymentHistory_loader: false,
        paymentHistory_error: '',
      }));
      setHasMore(hasMore);
    } catch (error) {
      setInformation((prev) => ({
        ...prev,
        paymentHistory_loader: false,
        paymentHistory_error: error.message || 'Something went wrong',
      }));
    }
  }

  // Infinite scroll handler
  function handleScroll() {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (!information.paymentHistory_loader && hasMore) {
        setPage((prev) => prev + 1); // Increment the page
      }
    }
  }

  useEffect(() => {
    fetchDetails();
  }, [page]); // Re-fetch data when the page changes

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [information.paymentHistory_loader, hasMore]); // Rebind scroll handler when loader or hasMore changes


  return (
    (<div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6"> <ArrowLeft className="cursor-pointer" onClick={() => window.location.href = "/home"} /> Payment History</h1>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {
          <>
            {
              information?.paymentHistory?.length > 0 &&
              information.paymentHistory.map((connection, index) => {

                let paymentURL = "/history/payment/";

                if (connection.method !== "recharge" && connection.method !== "vpa") {
                  if (connection.sId === user.id) {
                    paymentURL += connection.rId;
                  } else {
                    paymentURL += connection.sId;
                  }
                }

                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {
                          connection.method === "vpa" ?
                            <Image src={"/UPI.svg"} width={50} height={32} alt="upi" />
                            : connection.method === "recharge" ?
                              <Image src={"/landingPage/recharge.png"} width={20} height={15} alt="recharge" />
                              :
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder-user.svg" alt="@shadcn" />
                                <AvatarFallback>AC</AvatarFallback>
                              </Avatar>
                        }
                        <div>
                          {
                            connection.method === "vpa" ?
                              <>
                                {
                                  JSON.parse(connection.details).name ?
                                    <div className="flex flex-col items-start justify-start">
                                      <div className="font-medium text-sm">{JSON.parse(connection.details).name}</div>
                                      <div className=" font-semibold text-muted-foreground text-xs">{JSON.parse(connection.details).address}</div>
                                    </div>
                                    :
                                    <div className="font-medium text-sm">{JSON.parse(connection.details).address}</div>

                                }
                              </>
                              :
                              <div className="font-medium">{connection.name}</div>
                          }
                          <div className="text-xs text-muted-foreground">{new Date(connection.paid_at).toDateString()}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {
                          connection.method === "recharge" ?
                            <>
                              <div className={`text-lg text-green-700  font-bold`}>+ ₹{connection.amount}</div>
                              <Badge variant="secondary">Recharged</Badge>
                            </>
                            :
                            <>
                              <div className={`text-lg ${user.id === connection.sId ? "text-red-500" : 'text-green-700'}  font-bold`}>{user.id === connection.sId ? "-" : "+"} ₹{connection.amount}</div>
                              <Badge variant="secondary">{user.id === connection.sId ? "Sent" : "Received"}</Badge>
                            </>
                        }
                      </div>
                      <p className="text-sm text-gray-500 font-semibold">{connection?.note?.length > 60 ? `${connection?.note?.slice(0, 59)}...` : connection.note}</p>
                      {
                        connection.method !== "recharge" && connection.method !== "vpa" &&
                        <div onClick={() => window.location.href = paymentURL} className="text-sm flex items-center w-full gap-1 justify-end text-gray-500 font-semibold my-2"> <button className="flex items-center bg-secondary px-2 gap-1 rounded-full">View <ArrowRight /> </button></div>
                      }
                    </CardContent>
                  </Card>
                )
              }
              )
            }

          </>
        }
        {
          information.paymentHistory_loader &&
          <>
            <HistoryLoader />
            <HistoryLoader />
            <HistoryLoader />
            <HistoryLoader />
          </>
        }
      </div>
      {
        !hasMore &&
        <p className="text-sm text-gray-500 font-semibold w-full my-3 items-center flex justify-center">You reached to the end.</p>
      }
    </div>)
  );
}
