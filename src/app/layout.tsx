import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Banner from "@/components/Banner/Banner";

export const metadata: Metadata = {
  title: "Tempname",
  description: "Book last-minute dental appointments with ease.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Banner />
        {children}
      </body>
    </html>
  );
}
