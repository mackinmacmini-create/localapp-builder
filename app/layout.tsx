import type { Metadata } from "next";
import { Calistoga, Inter } from "next/font/google";
import "./globals.css";

const calistoga = Calistoga({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-calistoga",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LocalApp — Build Your Own App in Minutes",
  description:
    "Give your local business a branded mobile app with loyalty rewards, online ordering, and push notifications. No code required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${calistoga.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] font-sans">
        {children}
      </body>
    </html>
  );
}
