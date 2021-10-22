import { signIn, useSession } from "next-auth/client";
import useSelf from "../SWR/useSelf";
import Loader from "../components/Loader";
import Login from "../components/Login";
import { useRouter } from "next/router";
import { useState } from "react";
export default function Login() {
  const defaultButtonText = `Click me to log in!`;
  const router = useRouter();
  let { user_id, key, callback_url } = router.query;

  const { user, isUserLoading, isUserError } = useSelf();
  const [button_text, setButtonText] = useState(defaultButtonText);
  const callbackUrl = `${process.env.PLUTOMI_URL}/dashboard`; // TODO bad names / confusing
  if (callback_url?.includes(`${process.env.PLUTOMI_URL}/login`)) {
    callback_url = callbackUrl;
  }
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return <Loader text="Loading..." />;
  }

  if (user_id && key) {
    const handleSignin = async () => {
      setButtonText("Logging in...");
      const { error } = await signIn("credentials", {
        redirect: false,
        user_id: user_id,
        key: key,
        callbackUrl: callback_url as string,
      });

      if (error) {
        alert(error);
        setButtonText(defaultButtonText);
      }

      if (!error) {
        // This is dumb
        router.push((callback_url as string) || callbackUrl);
      }
    };

    return (
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
        <main className="mt-5 mx-auto flex justify-center">
          <button
            type="button"
            onClick={handleSignin}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-4xl font-medium rounded-lg text-dark bg-white hover:bg-blue-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ease-in-out duration-200"
          >
            {button_text}
          </button>
        </main>
      </div>
    );
  }

  return <Login callbackUrl={callbackUrl} desiredPageText={"your account"} />;
}
