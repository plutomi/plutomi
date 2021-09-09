/* This example requires Tailwind CSS v2.0+ */
import Pricing from "../components/Pricing";
import Contact from "../components/ContactUs";
import SignIn from "../components/SignIn";
import FeatureBox from "../components/featureBox";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import AlreadySignedIn from "../components/AlreadySignedIn";
export default function Main() {
  const [session, loading] = useSession();
  const { error } = useRouter().query;
  const router = useRouter();

  // if (loading) {
  //   return <h1>Loading...</h1>;
  // }

  return (
    <div className="">
      <main className="bg-gradient-to-b from-blue-gray-50 to-white">
        <Navbar />
        <Hero />

        {error ? (
          <p>An error ocurred logging you in. Please try again.</p>
        ) : session ? (
          <AlreadySignedIn />
        ) : (
          <SignIn callbackUrl={`${process.env.NEXTAUTH_URL}/dashboard`} />
        )}

        <FeatureBox />
      </main>
      <section className="relative border-0 ">
        <div className="custom-shape-divider-top-1630498878">
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
    </div>
  );
}
