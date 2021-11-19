import AlreadySignedIn from "../components/AlreadySignedIn";
import FeatureBox from "../components/Static/featureBox";
import Navbar from "../components/Navbar/HomepageNavbar";
import Contact from "../components/Static/ContactUs";
import Pricing from "../components/Pricing/Pricing";
import LoginHomepage from "../components/LoginHomepage";
import UseCases from "../components/UseCases";
import Hero from "../components/Static/Hero";
import useSelf from "../SWR/useSelf";
import WarningBanner from "../components/WarningBanner";
export default function Main() {
  const { user, isUserLoading, isUserError } = useSelf();
  return (
    <>
      <main className="bg-gradient-to-b from-blue-gray-50 to-white via-homepageGradient">
        <WarningBanner />

        <Navbar />
        <Hero />
        {!user || isUserError ? (
          <LoginHomepage
            callbackUrl={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard`}
          />
        ) : (
          <AlreadySignedIn />
        )}
        <FeatureBox />
        <UseCases />
      </main>

      <section className="relative border-0 ">
        <div className="custom-shape-divider-top-1630498878 ">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>

      <Pricing />
      <Contact />
    </>
  );
}
