import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LandingHero, HomepageFooter } from "~/components";
import { UseCaseCards } from "~/components/UseCases/UseCaseCards";
import { ViewOnGitHubButton } from "~/components/GithubButton";
import { UseCaseSegment } from "~/components/UseCases/UseCaseSegment";

export const loader = async () => {
  return json({
    podName: process.env.POD_NAME
  });
};

export default function LandingPage() {
  const { podName }: { podName: string } = useLoaderData();
  return (
    <div className="w-full  flex justify-center bg-gradient-to-b from-white to-cyan-50  min-h-full  h-screen">
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
