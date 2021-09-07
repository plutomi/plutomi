/* This example requires Tailwind CSS v2.0+ */
import { signOut, useSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";
import GoogleButton from "./GoogleButton";
import axios from "axios";
import LoginCode from "./LoginCode";
import LoginEmail from "./LoginEmail";
import Link from "next/dist/client/link";
import { useState } from "react";
interface CallbackUrl {
  callbackUrl?: string;
}
export default function SignIn({ callbackUrl }: CallbackUrl) {
  const [user_email, setUserEmail] = useState("");
  const [login_code, setLoginCode] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleEmailChange = (newEmail) => {
    setUserEmail(newEmail);
  };

  const handleLoginCodeChange = (newCode) => {
    setLoginCode(newCode);
  };

  const sendEmail = async (e) => {
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

  const signInWithCode = (e) => {
    e.preventDefault();

    signIn("credentials", {
      user_email: user_email,
      login_code: login_code,
      callbackUrl: callbackUrl,
    });
  };

  const [session, loading] = useSession();
  const { error } = useRouter().query;
  const router = useRouter();

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return <p>An error ocurred logging you in. Please try again.</p>;
  }

  if (!session) {
    return (
      <div className="flex justify-center flex-col w-full items-center ">
        <GoogleButton callbackUrl={callbackUrl}/>
        <p className="my-4 text-lg text-blue-gray-600 text-center sm:max-w-8xl max-w-sm">
          Or we can email you a magic code for a password-free sign in.
        </p>
        <h1>Router query: {JSON.stringify(router.query)}</h1>
        <h1>Router as path: {JSON.stringify(router.asPath)}</h1>
        <h1>Router basepath: {JSON.stringify(router.basePath)}</h1>
        <h1>Router route: {JSON.stringify(router.route)}</h1>
        <h1>Router pathname: {JSON.stringify(router.pathname)}</h1>

        {formSubmitted ? (
          <LoginCode
            onChange={handleLoginCodeChange}
            login_code={login_code}
            signInWithCode={signInWithCode}
          />
        ) : (
          <LoginEmail
            onChange={handleEmailChange}
            user_email={user_email}
            sendEmail={sendEmail}
          />
        )}
      </div>
    );
  }

  if (session) {
    console.log("session exists");

    return (
      <section id="login" className="flex  justify-center mx-auto ">
        <div className="mx-auto flex justify-center space-x-2  items-center text-lg text-blue-gray-600 ">
          <p className="px-2"> Signed in as {session?.user?.user_email} </p>
          {router.route === "/" ? (
            <Link href="/dashboard">
              <a
                type="button"
                className="px-4 py-2 bg-blue-gray-900 text-white rounded-md"
              >
                Go to Dashboard &rarr;
              </a>
            </Link>
          ) : null}

          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      </section>
    );
  }
}
