import { HomepageFooter, LandingHero } from "@/components";
import LatestCommits from "@/components/LatestCommits/LatestCommits";
import { UseCaseSegment } from "@/components/UseCases/UseCaseSegment";

export default function Page() {
  return (
    <div className="w-full h-full flex justify-center">
      <div className="flex flex-col my-32  items-center space-y-4 ">
        <LandingHero />
        <>
          <UseCaseSegment />
          <LatestCommits />
        </>
        <HomepageFooter />
      </div>
    </div>
  );
}
