import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";
import "./tailwind.css";

const rootBg = "bg-white";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${rootBg} tabular-nums font-customFont h-full min-h-full`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={`${rootBg} h-full `}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
