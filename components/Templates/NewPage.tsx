import SignedInNav from "../../components/Navbar/SignedInNav";
import OpeningsHeader from "../../components/Openings/OpeningsHeader";
import useSelf from "../../SWR/useSelf";
import Loader from "../../components/Loader";
import Login from "../../components/Login";
import PageHeader from "./PageHeader";
export default function NewPage({
  headerText,
  loggedOutPageText,
  currentNavbarItem,
  children,
}) {
  const { user, isUserLoading, isUserError } = useSelf();

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return <Loader text="Loading..." />;
  }

  if (isUserError) {
    return <Login loggedOutPageText={loggedOutPageText} />;
  }

  return (
    <>
      <SignedInNav current={currentNavbarItem} />
      <header className="max-w-7xl border border-red-400 mx-auto  p-4 my-6 rounded-lg ">
        <PageHeader headerText={headerText} />
      </header>

      <main className="max-w-7xl border border-blue-400 mx-auto  p-4 my-6 rounded-lg min-h-screen bg-white">
        {children}
      </main>
    </>
  );
}
