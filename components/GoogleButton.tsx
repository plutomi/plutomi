import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/client";
import { useRouter } from "next/router";
export default function GoogleButton({ callbackUrl }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: callbackUrl })}
      className="space-x-2 inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {" "}
      <FcGoogle className="h-8 w-8" />
      <span>Sign in with Google</span>
    </button>
  );
}
