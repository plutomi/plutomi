import { Outlet } from "@remix-run/react";

export default function DocsRoot (){
    return (
        <div className="w-full h-full">
      <h1>Docs Root</h1>
       <Outlet/>
        </div>
    );
}
