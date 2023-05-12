import LandingHero from "@/components/LandingHero/LandingHero";
import { UseCaseSection } from "@/components/UseCases";
import { WaitListCard } from "@/components/WaitistCard";
import { Space } from "@mantine/core";
import type { NextPage } from "next";

const Home: NextPage = () => (
  <>
    <LandingHero />
    <Space h="lg" />
    <UseCaseSection />
    <Space h="lg" />
    <WaitListCard />
  </>
);

export default Home;
