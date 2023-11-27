import { HomepageFooter, LandingHero, UseCaseSection } from "@/components";
import CommitLoading from "@/components/LatestCommits/CommitLoading";
import LatestCommits from "@/components/LatestCommits/LatestCommits";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="w-full h-full flex justify-center">
      <div className="flex flex-col my-32  items-center">
        <LandingHero />
        <div className="w-full flex justify-center">
          <UseCaseSection />
        </div>
        <div className="w-full flex justify-center mt-12 ">
          <div className="w-full max-w-3xl space-y-3 flex flex-col justify-center px-4 lg:px-0">
            <div className="border-b border-slate-200 pb-5">
              <h3 className="text-3xl font-semibold leading-6 text-slate-900 ">
                Latest Changes
              </h3>
            </div>

            <Suspense
              fallback={[1, 2, 3, 4].map((i) => (
                <CommitLoading key={i} />
              ))}
            >
              <LatestCommits />
            </Suspense>
          </div>
        </div>
        <div className=" w-full mt-12 flex justify-center">
          <HomepageFooter />
        </div>
      </div>
    </div>
  );
}
