import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/client";
import { useState } from "react";
export default function GoogleButton({ callbackUrl }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    signIn("google", { callbackUrl: callbackUrl });
  };
  return (
    <button
      type="button"
      onClick={() => handleSubmit()}
      className="space-x-2 inline-flex items-center px-4 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-gray-500"
    >
      {submitted ? (
        <>
          <span>Loading...</span>
        </>
      ) : (
        <>
          <FcGoogle className="h-8 w-8" />
    
          <span>Sign in with Google</span>
        </>
      )}
    </button>
  );
}
