import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { PinProvider } from "@/context/PinProvider";
import ReduxProvider from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "WalletXpress - Easy way to manage your finance",
  description: "WalletXpress is the app that allows you to conduct online transactions without involving banks. Send and receive money through your e-wallet, no more bank hassles.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <AuthProvider>
            <PinProvider>
              {children}
            </PinProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
