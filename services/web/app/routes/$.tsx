import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async () => {
  return json({
    podName: process.env.POD_NAME
  });
};

export default function FourOhFour() {
  const { podName }: { podName: string } = useLoaderData();

  return (
    <div className="flex justify-center mt-30h-full">
      <p className="text-sm text-slate-400  absolute left-0">{podName}</p>
      <p className="text-4xl font-bold text-slate-700">404 - Not Found</p>
    </div>
  );
}
