import type { Metadata } from "next";
import "./globals.css";
import Banner from "@/components/Banner/Banner";
import { getUserFromCookies, tryRefreshUser } from '@/lib/utils/auth';
import { DeviceProvider } from "@/content/DeviceContent";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

export const metadata: Metadata = {
  title: "DentalConnect",
  description: "Book last-minute dental appointments with ease.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = await getUserFromCookies();

  if (!user) {
    user = await tryRefreshUser();
  }

  return (
    <html lang="en">
      <body>
        <DeviceProvider>
          <Banner />
          {children}
          <ToastContainer />
        </DeviceProvider>
      </body>
    </html>
  );
}
