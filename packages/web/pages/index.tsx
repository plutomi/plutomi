import LandingHero from "@/components/LandingHero/LandingHero";
import { WaitListCard } from "@/components/WaitistCard";
import type { NextPage } from "next";

const Home: NextPage = () => (
  <>
    <LandingHero />
    <WaitListCard />
  </>
);

export default Home;
