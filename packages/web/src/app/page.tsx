import { HomepageFooter, LandingHero, UseCaseSection } from "@/components";
import LatestCommits from "@/components/LatestCommits/LatestCommits";
import { Suspense } from "react";
import Loading from "../components/LatestCommits/loadingCommits";

export default function Page() {
  return (
    <div className="w-full h-full flex justify-center">
      <div className="flex flex-col my-32  items-center">
        <LandingHero />
        <div className="w-full flex justify-center">
          <UseCaseSection />
        </div>

        <div className="mt-12">
          <Suspense fallback={<Loading />}>
            <LatestCommits />
          </Suspense>
        </div>
        <div className=" w-full mt-12 flex justify-center">
          <HomepageFooter />
        </div>
      </div>
    </div>
  );
}
