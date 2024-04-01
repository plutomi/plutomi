import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LandingHero, HomepageFooter } from "~/components";
import LatestCommits from "~/components/LatestCommits/LatestCommits";
import { UseCaseCards } from "~/components/UseCases/UseCaseCards";
import { UseCaseSegment } from "~/components/UseCases/UseCaseSegment";

export const loader = async () => {
  return json({
    podName: process.env.POD_NAME
  });
};

export default function LandingPage() {
  const { podName }: { podName: string } = useLoaderData();
  return (
    <div className="w-full h-full flex justify-center">
      <p className="text-sm text-slate-400  absolute left-0">{podName}</p>
      <div className="py-32">
        <LandingHero />
        <div className="p-6 lg:p-0 lg:pt-4 w-full  flex flex-col items-center space-y-4">
          <UseCaseSegment />

          <div className="w-full ">
            <UseCaseCards />
          </div>
          <div className="pt-8 flex flex-col items-center space-y-4">
            {/* <LatestCommits /> */}
            <div className="lg:flex justify-center items-center flex-collg:w-full lg:visible hidden">
              <img
                className=" max-w-4xl  rounded-2xl lg:visible hidden lg:flex"
                src="/infra.png"
                alt="Infrastructure for plutomi"
              />
            </div>

            <div className="flex flex-col justify-center text-start lg:text-center">
              <p className="text-md lg:text-xl text-slate-700 ">
                Currently a work in progress! Make sure to checkout the latest
                changes on GitHub!
              </p>
              <a
                className="lg:text-lg text-md underline text-blue-500 hover:text-blue-700 text-start lg:text-center"
                href="https://github.com/plutomi/plutomi/pull/952"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://github.com/plutomi/plutomi/pull/952
              </a>
            </div>
            <HomepageFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
