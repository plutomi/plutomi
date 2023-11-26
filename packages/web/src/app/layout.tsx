import "../styles/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Plutomi",
  description: "Applicant management at any scale"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.className} bg-slate-100 text-slate-800`}
    >
      <Toaster />
      <body>{children}</body>
    </html>
  );
}
