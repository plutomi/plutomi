/* This example requires Tailwind CSS v2.0+ */
import Pricing from "../components/Static/Pricing";
import Contact from "../components/Static/ContactUs";
import SignIn from "../components/SignInHomepage";
import FeatureBox from "../components/Static/featureBox";
import Navbar from "../components/Navbar/HomepageNavbar";
import Hero from "../components/Static/Hero";
import { useSession } from "next-auth/client";
import useUser from "../SWR/useUser";
import AlreadySignedIn from "../components/AlreadySignedIn";
export default function Main() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  return (
    <div className="">
      <main className="bg-gradient-to-b from-blue-gray-50 to-white">
        <Navbar />
        <Hero />
        <h1>HERE: {process.env.NEXT_PUBLIC_NEXTAUTH_URL}</h1>
        {!session || isUserError ? (
          <SignIn
            callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard`}
          />
        ) : session && isUserLoading ? (
          <p className="mx-auto text-center text-blue-gray-600 text-lg">
            Loading user...
          </p>
        ) : session && user ? (
          <AlreadySignedIn user={user} />
        ) : null}
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
