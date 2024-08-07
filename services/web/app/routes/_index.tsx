import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import { LandingHero } from "../components/LandingHero";
import { ViewOnGitHubButton } from "../components/GithubButton";
import { UseCaseCards } from "../components/UseCases/UseCaseCards";
import { UseCaseSegment } from "../components/UseCases/UseCaseSegment";
import { HomepageFooter } from "../components/HomepageFooter";

export const loader = async () => {
  return json({
    podName: process.env.POD_NAME
  });
};

export default function LandingPage() {
  const { podName }: { podName: string } = useLoaderData();
  return (
    <div className="w-full  flex justify-center bg-gradient-to-b from-white to-stone-50  min-h-full h-100 ">
      <Toaster />
      <p className="text-sm text-slate-400  absolute left-0 ">{podName}</p>
      <div className="py-32 w-full  flex flex-col items-center">
        <LandingHero />
        <div className="p-6 lg:p-0 lg:pt-4  w-full flex flex-col items-center space-y-4">
          <UseCaseSegment />
          <div className="w-full   max-w-5xl">
            <UseCaseCards />
          </div>
          <ViewOnGitHubButton />

          <div className="pt-8 flex flex-col items-center space-y-4">
            <HomepageFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
