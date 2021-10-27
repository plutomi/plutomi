import { useRouter } from "next/router";
import Link from "next/link";
import useSelf from "../SWR/useSelf";
import AuthService from "../adapters/AuthService";
import { mutate } from "swr";
import UsersService from "../adapters/UsersService";
const handleLogout = async () => {
  try {
    const { message } = await AuthService.logout(); // TODO logout to same page
    alert(message);
    // TODO reroute to homepage
  } catch (error) {
    alert(error.response.message);
  }

  mutate(UsersService.getSelfURL()); // Refresh the login state
};
export default function AlreadySignedIn() {
  const { user, isUserLoading, isUserError } = useSelf();

  const router = useRouter();

  return (
    <section id="login" className="flex  justify-center mx-auto ">
      <div className="mx-auto  flex-col md:flex-wrap text-center space-y-2 md:space-y-0  justify-center space-x-2  items-center text-lg text-blue-gray-600 ">
        <p className="px-2 py-2"> Signed in as {user?.user_email}</p>
        {router.route === "/" && (
          <Link href="/dashboard">
            <a
              type="button"
              className="px-4 py-2 bg-normal hover:bg-dark  transition ease-in-out duration-200 text-white rounded-md"
            >
              Go to Dashboard &rarr;
            </a>
          </Link>
        )}
        <button
          className=" items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => handleLogout()}
        >
          Log out
        </button>
      </div>
    </section>
  );
}
