import { useRouter } from "next/router";
import { signOut, useSession, signIn } from "next-auth/client";
import Link from "next/link";
export default function AlreadySignedIn({ user }) {
  const router = useRouter();

  return (
    <section id="login" className="flex  justify-center mx-auto ">
      <div className="mx-auto flex justify-center space-x-2  items-center text-lg text-blue-gray-600 ">
        <p className="px-2"> Signed in as {user?.user_email}</p>
        {router.route === "/" && (
          <Link href="/dashboard">
            <a
              type="button"
              className="px-4 py-2 bg-blue-gray-900 text-white rounded-md"
            >
              Go to Dashboard &rarr;
            </a>
          </Link>
        )}
        <button
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
    </section>
  );
}
