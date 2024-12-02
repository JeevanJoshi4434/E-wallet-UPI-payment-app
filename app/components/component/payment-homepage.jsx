"use client";
import Link from "next/link"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react";
import Modal from "../Modal/Modals";
import { useDispatch, useSelector } from "react-redux";
import PaymentCard from "./payment-card";
import { useToast } from "@/context/ToastContext";
import QRCodeScanner from "./QR-code-Scanner";
import { login, performLogout } from "@/redux/authActions";
import { fetchLoggedInUser, getBalance, getConnections, getPaymentHistory } from "@/lib/APIs";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import SendMoney from "../Modal/Send-Money";
import AddUser from "../Modal/Add-User";
import Image from "next/image";

export function PaymentHomepage() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [information, setInformation] = useState({
    balance: null || 0,
    paymentHistory: null || [],
    connections: null || [],
    balance_loader: true,
    paymentHistory_loader: true,
    connections_loader: true,
    balance_error: '',
    paymentHistory_error: '',
    connections_error: ''
  })

  const { addToast } = useToast();
  const [QRModal, setQRModal] = useState(false);
  const [ScannerModal, setScannerModal] = useState(false);
  const [send, setSend] = useState(false);
  const [add, setAdd] = useState(false);
  function toggleSend() {
    setSend(!send);
  }
  function toggleAdd() {
    setAdd(!add);
  }
  function toggleQRModal() {
    setQRModal(!QRModal);
  }
  function toggleScannerModal() {
    setScannerModal(!ScannerModal);
  }

  function setConnections(data) {
    let newConnections = information.connections || [];
    newConnections.push(data);
    setInformation(...information, newConnections);
    setAdd(false);
  }

  async function fetchBalance(button = false) {
    try {
      if (button) {
        setInformation({ ...information, balance_loader: true });
      }
      const response = await getBalance(token);
      if (response.success) {
        if (button) {
          setInformation({ ...information, balance: response.balance, balance_loader: false });
        }
        return { balance: response.balance, balance_loader: false };
      }
      if (response.error) {
        if (button) {
          setInformation({ ...information, balance_loader: false });
          addToast("Failed to fetch balance!", 3000, "top-right", "error");
        }
        return { balance_error: response.message, balance_loader: false };
      }
    } catch (error) {
    }
  }

  async function fetchConnections() {
    try {
      const response = await getConnections(token);
      if (response.success) {
        return { connections: response.connections, connections_loader: false };
      }
      if (response.error) {
        return { connections_error: response.message, connections_loader: false };
      }
    } catch (error) {
    }
  }

  async function fetchPaymentHistory() {
    try {
      const response = await getPaymentHistory(token);
      if (response.success) {
        return { paymentHistory: response.history, paymentHistory_loader: false };
      }
      if (response.error) {
        return { paymentHistory_error: response.message, paymentHistory_loader: false };
      }
    } catch (error) {
    }
  }

  async function fetchDetails() {
    const { balance, balance_loader, balance_error } = await fetchBalance();
    const { paymentHistory, paymentHistory_loader, paymentHistory_error } = await fetchPaymentHistory();
    const { connections, connections_loader, connections_error } = await fetchConnections();
    setInformation({ ...information, balance, paymentHistory, connections, balance_loader, paymentHistory_loader, connections_loader, balance_error, paymentHistory_error, connections_error });
  }


  async function getUser() {
    try {
      const response = await fetchLoggedInUser(token);
      if (response.success) {
        await fetchDetails();
        dispatch(login(data.user, user.token));
      }
      if (response.error) {
        addToast('Please refresh the page', 3000, "top-right", "error");
      }
    } catch (error) {

    }
  }



  function logOut() {
    if (
      dispatch(performLogout()))
      window.location.href = "/";
    else {
      addToast("Something went wrong during logout!", 3000, "top-right", "error");
    }
  }

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    } else {
      getUser();
      fetchBalance();
      fetchPaymentHistory();
      fetchConnections();
    }
  }, [user])

  return (
    (<div className="flex h-full w-full flex-col bg-background">
      <header
        className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="#" className="flex items-center gap-2" prefetch={false}>
            <Package2Icon className="h-6 w-6" />
            <span className="font-semibold">Payment Karo</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <MdOutlineQrCodeScanner onClick={() => window.location.href = "/scan"} className=" cursor-pointer" size={20} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.svg" alt="@shadcn" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleQRModal}>View QR</DropdownMenuItem>
              <DropdownMenuItem>Transactions</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className=" relative rounded-full">
                <BellIcon className="h-6 w-6" />
                <span className="w-2 h-2 bg-black absolute top-0 right-0 rounded-full animate-pulse"></span>
                <span className="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <Link href="#" className="text-sm text-muted-foreground" prefetch={false}>
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BellIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Your call has been confirmed.</p>
                    <p className="text-xs text-muted-foreground">5 min ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <MailIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">You have a new message!</p>
                    <p className="text-xs text-muted-foreground">1 min ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Your subscription is expiring soon!</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <TriangleAlertIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Your account has been suspended.</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          <Button onClick={toggleSend} size="lg" className="flex flex-col items-center justify-center gap-2">
            <span>Send</span>
          </Button>
          <Button onClick={toggleQRModal} size="lg" className="flex flex-col items-center justify-center gap-2">
            <span>Receive</span>
          </Button>
          <Button size="lg" className="flex flex-col items-center justify-center gap-2">
            <span>Request Money</span>
          </Button>
          <Button size="lg" className="flex flex-col items-center justify-center gap-2">
            <span>Withdraw</span>
          </Button>
        </div>
        <div className="px-4 py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quick Add User</h2>
            <Button onClick={toggleAdd} variant="outline" size="sm">
              <PlusIcon className="h-4 w-4" />
              <span>Add User</span>
            </Button>
          </div>
          {
            information.connections_loader ?
              <>
                <div className="h-5 w-36 rounded-md bg-muted"></div>
                <div className="h-5 w-48 rounded-md bg-muted"></div>
              </>
              :
              <>
                {
                  information.connections?.length > 0 ?
                    <>
                      <div className="grid grid-cols-5 gap-4">
                        {
                          information.connections?.map((connection, ind) => {
                            if (user.id !== connection.id)
                              return (
                                <Link key={ind} href="#" className="flex flex-col items-center gap-2" prefetch={false}>
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src="/placeholder-user.svg" alt="@shadcn" />
                                    <AvatarFallback>AC</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">{connection.name}</span>
                                </Link>
                              )
                          })
                        }
                      </div>
                    </>
                    :
                    <p className="text-sm font-semibold text-center">Ops! Please add a connection to Quick Users.</p>


                }
              </>
          }
        </div>
        <div className="flex-1 bg-muted/40 px-4 py-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col items-start">
              <Link href="/balance/add" className=" text-xs ml-1 text-blue-700" >Add Balance</Link>
              <h2 className="text-lg font-semibold flex items-center">Current Balance</h2>
            </div>
            <Button onClick={() => fetchBalance(true)} disabled={information.balance_loader} variant="outline" size="sm">
              <RefreshCwIcon className={`h-4 w-4 ${information.balance_loader && 'spin'}`} />
              <span>Refresh</span>
            </Button>
          </div>
          <div className={`flex flex-col items-center justify-center gap-2 ${information.balance_loader && 'animate-pulse'}`}>
            {information.balance_loader ?
              <>
                <div className="h-12 w-12 rounded-full bg-muted"></div>
                <div className="h-5 w-48 rounded-md bg-muted"></div>
              </>
              :
              <>
                <div className="text-4xl font-bold">₹{information.balance}</div>
                <div className="text-muted-foreground">Available Balance</div>
              </>}
          </div>
        </div>
        <div className="px-4 py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Payments</h2>
            <Button variant="outline" size="sm">
              <EyeIcon className="h-4 w-4" />
              <Link href="/payment_history">View All</Link>
            </Button>
          </div>
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {
              !information.paymentHistory_loader ?
                <>
                  {
                    information.paymentHistory.length > 0 &&
                    information.paymentHistory.map((connection, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            {
                              connection.method === "vpa" ?
                                <Image src={"/UPI.svg"} width={50} height={32} alt="upi" />
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
                            <div className={`text-lg ${user.id === connection.sId ? "text-red-500" : 'text-green-700'}  font-bold`}>{user.id === connection.sId ? "-" : "+"} ₹{connection.amount}</div>
                            <Badge variant="secondary">{user.id === connection.sId ? "Sent" : "Received"}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 font-semibold">{connection?.note?.length > 60 ? `${connection?.note?.slice(0, 59)}...` : connection.note}</p>
                        </CardContent>
                      </Card>
                    ))
                  }
                </>
                :
                <>
                  <HistoryLoader />
                  <HistoryLoader />
                  <HistoryLoader />
                  <HistoryLoader />
                </>
            }
          </div>
        </div>
      </main>
      <Modal isOpen={send} onClose={toggleSend} >
        <SendMoney />
      </Modal>
      <Modal isOpen={add} onClose={toggleAdd} >
        <AddUser setConnections={setConnections} />
      </Modal>
      <Modal isOpen={QRModal} onClose={toggleQRModal}>
        <PaymentCard user={user} />
      </Modal>
      <Modal isOpen={ScannerModal} onClose={toggleScannerModal}>
        <QRCodeScanner />
      </Modal>

    </div>

    )
  );
}

function BellIcon(props) {
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
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>)
  );
}


function CalendarIcon(props) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>)
  );
}


function EyeIcon(props) {
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>)
  );
}


function MailIcon(props) {
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
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>)
  );
}


function Package2Icon(props) {
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
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>)
  );
}


function PlusIcon(props) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>)
  );
}


function RefreshCwIcon(props) {
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
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>)
  );
}


function TriangleAlertIcon(props) {
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
      <path
        d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>)
  );
}


const HistoryLoader = () => {
  return (
    <Card >
      <CardHeader>
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-8 w-8 rounded-full bg-muted"></div>
          <div>
            <div className="h-2 w-8 my-1 rounded-md bg-muted"></div>
            <div className="h-2 w-10 rounded-md bg-muted"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex animate-pulse items-center justify-between">
          <div className="h-4 w-8 rounded-md bg-muted"></div>
          <div className="h-4 w-8 rounded-md bg-muted"></div>
        </div>
      </CardContent>
    </Card>
  )
}