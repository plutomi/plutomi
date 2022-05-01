import SignedInNav from '../components/Navbar/SignedInNav';
import useSelf from '../SWR/useSelf';
import UserProfileHeader from '../components/UserProfile/UserProfileHeader';
import UserProfileModal from '../components/UserProfile/UserProfileModal';
import Loader from '../components/Loader';
import Login from '../components/Login';

export default function Team() {
  const { user, isUserLoading, isUserError } = useSelf();

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && isUserLoading) {
    return <Loader text="Loading..." />;
  }

  if (isUserError) {
    return <Login loggedOutPageText={'Log in to view your profile'} />;
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  return (
    <>
      <UserProfileModal user={user} />
      <SignedInNav current="PLACEHOLDER" />
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
        <header>
          <UserProfileHeader />
        </header>

        <main className="mt-5">
          <h1 className="text-2xl font-bold text-dark">There&apos;s not much here... yet!</h1>
        </main>
      </div>
    </>
  );
}
