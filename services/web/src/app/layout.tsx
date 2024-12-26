import type { Metadata } from "next";
import localFont from "next/font/local";
const calibre = localFont({
  src: [
    {
      path: "../../public/fonts/Calibre-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Calibre-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Calibre-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
});

import "./globals.css";

export const metadata: Metadata = {
  title: "Plutomi",
  description: "Making Applicant Management Great Again",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body
        className={`${calibre.className} antialiased text-slate-800 bg-snow`}
      >
        {children}
      </body>
    </html>
  );
}
