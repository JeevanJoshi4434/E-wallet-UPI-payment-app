"use client";
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getLang, setLanguage } from "../language/Language"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
export function LandingPage() {
  let language = getLang();

  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <DollarSignIcon className="h-6 w-6" />
          <span className="text-md font-semibold">WalletXpress</span>
        </Link>
        <nav className="ml-auto flex gap-4 items-center justify-center sm:gap-6">
          <Link
            href="#feature"
            className="text-sm max-sm:hidden font-medium hover:underline underline-offset-4"
            prefetch={false}>
            Features
          </Link>
          {user ?
            <Link
            href="/home"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}>
            {language.Home}
          </Link>
          :
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}>
            {language.getStarted}
          </Link>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <p className="">Lang</p>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem >
                <p onClick={() => setLanguage('en')}>
                  English
                </p>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <p onClick={() => setLanguage('hindi')}>
                  हिंदी
                </p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <p onClick={() => setLanguage('en')}>
                  Default
                </p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div
              className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1
                    className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    {language.landingPage.section1.title}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {language.landingPage.section1.desc}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  { user ?
                    <Link
                    href="/ome"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}>
                    {language.Home}
                  </Link> 
                  :
                    <Link
                    href="/login"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}>
                    {language.getStarted}
                  </Link>
                  }
                  <Link
                    href="#learnMore"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}>
                    {language.learnMore}
                  </Link>
                </div>
              </div>
              <img
                src="/landingPage/hero.png"
                width="550"
                height="550"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square" />
            </div>
          </div>
        </section>
        <section id="feature" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div
              className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{language.landingPage.keyFeature.title}</h2>
                <p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {language.landingPage.keyFeature.desc}
                </p>
              </div>
            </div>
            <div
              className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <img src="/landingPage/instant.png" alt="img" className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square" />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  {
                    language.landingPage.keyFeature.features.map((feature, index) => (
                      <li key={index}>
                        <div className="grid gap-1">
                          <h3 className="text-xl font-bold">{feature.title}</h3>
                          <p className="text-muted-foreground">
                            {feature.desc}
                          </p>
                        </div>
                      </li>
                    ))
                  }
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div
              className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{language.landingPage.workFlow.title}</h2>
                <p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {language.landingPage.workFlow.desc}
                </p>
              </div>
            </div>
            <div
              className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 animate-fade-in-right">
                <ul className="grid gap-6">
                  {
                    language.landingPage.workFlow.steps.map((feature, index) => (
                      <li key={index}>
                        <div className="grid gap-1">
                          <h3 className="text-xl font-bold">{feature.title}</h3>
                          <p className="text-muted-foreground">
                            {feature.desc}
                          </p>
                        </div>
                      </li>
                    ))
                  }
                </ul>
              </div>
              <img
                src="/landingPage/payment.jpg"
                width="550"
                height="310"
                alt="Image"
                className="mx-auto aspect-video border border-gray-200 overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last animate-fade-in-left" />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div
              className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{language.landingPage.review.title}</h2>
                <p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {language.landingPage.review.desc}
                </p>
              </div>
            </div>
            <div
              className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="grid gap-2 rounded-lg bg-card p-4">
                  <p className="text-muted-foreground">
                    {"WalletXpress has been a game-changer for my business. The instant transactions and secure payments\nhave made managing my finances so much easier."}
                  </p>
                  <div className="flex items-center gap-2">
                    <Avatar className="border w-10 h-10">
                      <AvatarImage src="/placeholder-user.jpg" alt="User Image" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">Business Owner</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 rounded-lg bg-card p-4">
                  <p className="text-muted-foreground">
                    {"I love how easy it is to use WalletXpress. The app is intuitive, and I can manage all my\ntransactions without the hassle of banks."}
                  </p>
                  <div className="flex items-center gap-2">
                    <Avatar className="border w-10 h-10">
                      <AvatarImage src="/placeholder-user.jpg" alt="User Image" />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Sarah Miller</p>
                      <p className="text-xs text-muted-foreground">Student</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="grid gap-2 rounded-lg bg-card p-4">
                  <p className="text-muted-foreground">
                    {"WalletXpress has been a lifesaver for me. I can now send and receive money without worrying about\nbank issues or delays."}
                  </p>
                  <div className="flex items-center gap-2">
                    <Avatar className="border w-10 h-10">
                      <AvatarImage src="/placeholder-user.jpg" alt="User Image" />
                      <AvatarFallback>MR</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Michael Rodriguez</p>
                      <p className="text-xs text-muted-foreground">Freelancer</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 rounded-lg bg-card p-4">
                  <p className="text-muted-foreground">
                    {"I highly recommend WalletXpress to anyone who wants a hassle-free way to manage their finances.\nIt's been a game-changer for me."}
                  </p>
                  <div className="flex items-center gap-2">
                    <Avatar className="border w-10 h-10">
                      <AvatarImage src="/placeholder-user.jpg" alt="User Image" />
                      <AvatarFallback>LW</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Lisa Wang</p>
                      <p className="text-xs text-muted-foreground">Homemaker</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">{language.getStartedWithPaymentKaro}</h2>
              <p
                className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function DollarSignIcon(props) {
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
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>)
  );
}
