import { HomepageFooter, LandingHero } from "@/components";
import LatestCommits from "@/components/LatestCommits/LatestCommits";
import { UseCaseSegment } from "@/components/UseCases/UseCaseSegment";

export default function Page() {
  return (
    <div className="w-full h-full flex justify-center">
      <div className="flex flex-col my-32  items-center">
        <LandingHero />
        <div className="w-full flex justify-center">
          <UseCaseSegment />
        </div>

        {/* <div className="mt-12">
        <WaitListCard />
      </div> */}
        <div className="mt-12">
          <LatestCommits />
        </div>
        <div className=" w-full mt-12 flex justify-center">
          <HomepageFooter />
        </div>
      </div>
    </div>
  );
}
