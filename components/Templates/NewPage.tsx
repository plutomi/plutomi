import SignedInNav from "../../components/Navbar/SignedInNav";
import useSelf from "../../SWR/useSelf";
import Loader from "../../components/Loader";
import Login from "../../components/Login";
import PageHeader from "./PageHeader";
import { useRouter } from "next/router";
import { DOMAIN_NAME, NAVBAR_NAVIGATION, WEBSITE_URL } from "../../Config";
import { DEFAULTS } from "../../Config";
export default function NewPage({
  headerText,
  loggedOutPageText,
  currentNavbarItem,
  children,
}) {
  const router = useRouter();
  const { user, isUserLoading, isUserError } = useSelf();

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return <Loader text="Loading..." />;
  }

  if (isUserError) {
    return <Login loggedOutPageText={loggedOutPageText} />;
  }

  const currentNavItem = NAVBAR_NAVIGATION.find(
    (navItem) => navItem.name === currentNavbarItem
  );

  // Redirect on no org
  // TODO i believe this is triggering twice...
  if (currentNavItem.hiddenIfNoOrg && user?.orgId === DEFAULTS.NO_ORG) {
    const item =
      currentNavItem.name === "Openings" ? "openings" : "team members";
    alert(
      `You must create an org or join one before adding or viewing ${item}. If you have pending invites, you can view them at ${WEBSITE_URL}/invites`
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
