import "../../styles/globals.css";

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
    <>
      <head></head>
      <html lang="en" className="bg-slate-100">
        <body>{children}</body>
      </html>
    </>
  );
}
