import type { Metadata } from "next";
import "./globals.css";
import Banner from "@/components/Banner/Banner";
import { getUserFromCookies, tryRefreshUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: "Tempname",
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
        <Banner />
        {user ? (<p>Welcome</p>) : (<p>Sign in</p>)}
        {children}
      </body>
    </html>
  );
}
