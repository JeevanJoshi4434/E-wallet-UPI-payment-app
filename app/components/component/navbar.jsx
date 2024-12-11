import React from 'react'

const NavBar = () => {
    return (
        <header
            className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm">
            <div className="flex items-center gap-4">
                <Link href="#" className="flex items-center gap-2" prefetch={false}>
                    <Package2Icon className="h-6 w-6" />
                    <span className="font-semibold">WalletXpress</span>
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
    )
}

export default NavBar