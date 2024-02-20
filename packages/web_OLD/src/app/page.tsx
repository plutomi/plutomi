import { HomepageFooter, LandingHero } from "@/components";
import LatestCommits from "@/components/LatestCommits/LatestCommits";
import { UseCaseCards } from "@/components/UseCases/UseCaseCards";
import { UseCaseSegment } from "@/components/UseCases/UseCaseSegment";

export default function Page() {
  return (
    <div className="w-full h-full flex justify-center">
      <div className="py-32">
        <LandingHero />
        <div className="p-6 lg:p-0 lg:pt-4 w-full  flex flex-col items-center space-y-4">
          <UseCaseSegment />

          <div className="w-full ">
            <UseCaseCards />
          </div>
          <div className="pt-8 flex flex-col items-center space-y-4">
            <LatestCommits />
            <HomepageFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
