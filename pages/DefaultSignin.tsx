/* This example requires Tailwind CSS v2.0+ */
import NewPricing from "../components/Pricing";
import { signOut, useSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";

import Contact from "../components/ContactUs";
import FeatureBox from "../components/featureBox";
import Navbar from "../components/navbar";
import axios from "axios";
import Link from "next/dist/client/link";
import { ReactEventHandler, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/outline";
export default function Main() {
  const router = useRouter();
  const [user_email, setUserEmail] = useState("");
  const [login_code, setLoginCode] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault();
    const body = {
      user_email: user_email,
    };

    try {
      const { status, data } = await axios.post("/api/auth/login-code", body);
      setFormSubmitted(true);
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const [session, loading] = useSession();
  const { error } = useRouter().query;
  return (
    <section id="login2">
      <>
        {!session && (
          <>
            Not signed in <br />
            <button
              className="px-4 py-2 bg-blue-300"
              onClick={() => signIn("google")}
            >
              Sign in with google
            </button>
          </>
        )}
        {error && <p>An error ocurred logging you in. Please try again.</p>}

        {session && (
          <>
            Signed in as {session?.user?.email} <br />
            <p>SESSION {JSON.stringify(session)}</p>
            <button onClick={() => signOut()}>Sign out</button>
          </>
        )}
      </>
    </section>
  );
}
