import { useRouter } from 'next/router';
import SignedInNav from '../Navbar/SignedInNav';
import useSelf from '../../SWR/useSelf';
import Login from '../Login';
import PageHeader from './PageHeader';
import { NAVBAR_NAVIGATION, WEBSITE_URL, DEFAULTS } from '../../Config';

interface NewPageProps {
  headerText: string;
  loggedOutPageText: string;
  currentNavbarItem: string;
  children: React.ReactElement;
}
export default function NewPage({
  headerText,
  loggedOutPageText,
  currentNavbarItem,
  children,
}: NewPageProps) {
  const router = useRouter();
  const { user, isUserLoading, isUserError } = useSelf();

  if (isUserError) {
    return <Login loggedOutPageText={loggedOutPageText} />;
  }

  const currentNavItem = NAVBAR_NAVIGATION.find((navItem) => navItem.name === currentNavbarItem);

  // Redirect on no org
  // TODO i believe this is triggering twice...
  if (currentNavItem.hiddenIfNoOrg && user?.orgId === DEFAULTS.NO_ORG) {
    alert(
      `You must create an org or join one before viewing the ${currentNavItem.name} page. If you have pending invites, you can view them at ${WEBSITE_URL}/invites`,
    );
    router.push(`${WEBSITE_URL}/dashboard`);

    return null;
  }

  return (
    <>
      <SignedInNav current={currentNavbarItem} />
      <header className="max-w-7xl mx-auto  p-4 my-6 rounded-lg ">
        <PageHeader headerText={headerText} />
      </header>

      <main className="max-w-7xl  mx-auto  p-4 my-6 rounded-lg min-h-screen bg-white">
        {children}
      </main>
    </>
  );
}
