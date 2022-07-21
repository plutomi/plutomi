import { useRouter } from 'next/router';
import { useSelf } from '../../SWR/useSelf';
import { NAVBAR_NAVIGATION, WEBSITE_URL, DEFAULTS } from '../../Config';
import { NewPageHeader } from '../PageHeader';
import { Login } from '../Login';
import { SignedInNav } from '../SignedInNavbar';

interface NewPageProps {
  headerText: string;
  loggedOutPageText: string;
  currentNavbarItem: string;
  children: React.ReactElement;
}

export const NewPageLayout = ({
  headerText,
  loggedOutPageText,
  currentNavbarItem,
  children,
}: NewPageProps) => {
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
        <NewPageHeader headerText={headerText} />
      </header>

      <main className="max-w-7xl  mx-auto  p-4 my-6 rounded-lg min-h-screen bg-white">
        {children}
      </main>
    </>
  );
};
