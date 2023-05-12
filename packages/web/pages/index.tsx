import LandingHero from "@/components/LandingHero/LandingHero";
import { UseCaseSection } from "@/components/UseCases";
import { WaitListCard } from "@/components/WaitistCard";
import type { NextPage } from "next";

const Home: NextPage = () => (
  <>
    <LandingHero />
    <UseCaseSection />
    <WaitListCard />
  </>
);

export default Home;
