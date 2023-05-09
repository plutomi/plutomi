import LandingHero from "@/components/LandingHero/LandingHero";
import { WaitListCard } from "@/components/WaitistCard";
import { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <LandingHero />
      <WaitListCard />
    </>
  );
};

export default Home;
