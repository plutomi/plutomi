import { Login } from '../adapters/Auth';
import { Loader } from '../components/Loader';
import { useSelf } from '../SWR/useSelf';
import * as LoginComponent from '../components/Login';
import { UpdateUserProfileModal } from '../components/UpdateUserInfoModal';
import { SignedInNav } from '../components/SignedInNavbar';
import { UserProfilePageHeader } from '../components/UserProfilePageHeader';

export default function Team() {
  const { user, isUserLoading, isUserError } = useSelf();

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && isUserLoading) return <Loader text="Loading..." />;

  if (isUserError) return <LoginComponent.Login loggedOutPageText="Log in to view your profile" />;

  if (isUserLoading) return <Loader text="Loading user..." />;

  return (
    <>
      <UpdateUserProfileModal user={user} />
      <SignedInNav current="PLACEHOLDER" />
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
        <header>
          <UserProfilePageHeader />
        </header>

        <main className="mt-5">
          <h1 className="text-2xl font-bold text-dark">There&apos;s not much here... yet!</h1>
        </main>
      </div>
    </>
  );
}
