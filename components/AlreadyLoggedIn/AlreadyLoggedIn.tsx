import { useRouter } from 'next/router';
import Link from 'next/link';
import { mutate } from 'swr';
import { useSelf } from '../../SWR/useSelf';
import { Logout } from '../../adapters/Auth';
import { GetSelfInfoURL } from '../../adapters/Users';

const handleLogout = async (isHomepage: boolean) => {
  try {
    const { data } = await Logout(); // TODO logout to same page
    if (isHomepage) {
      window.location.reload();
    }
    return;
    // alert(data.message);
    // TODO reroute to homepage
  } catch (error) {
    alert(error.response.message);
  }

  mutate(GetSelfInfoURL());
};

export const AlreadyLoggedIn = () => {
  const router = useRouter();

  const { user, isUserLoading, isUserError } = useSelf();

  return (
    <section id="login" className="flex  justify-center mx-auto ">
      <div className="mx-auto  flex-col md:flex-wrap text-center space-y-2 md:space-y-0  justify-center space-x-2  items-center text-lg text-blue-gray-600 ">
        <p className="px-2 py-2">
          Signed in as <strong>{user?.email}</strong>
        </p>

        <Link href="/dashboard" passHref>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/dashboard"
            className="px-4 py-2 bg-normal hover:bg-dark  transition ease-in-out duration-200 text-white rounded-md"
          >
            Go to Dashboard &rarr;
          </a>
        </Link>

        <button
          type="submit"
          className=" items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => handleLogout(router.asPath === '/' && true)}
        >
          Log out
        </button>
      </div>
    </section>
  );
};
