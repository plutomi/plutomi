import { Outlet } from "@remix-run/react";

export default function APIRoot() {
  return (
    <div className="w-full h-full">
      <h1>Api Root</h1>
      <Outlet />
    </div>
  );
}
