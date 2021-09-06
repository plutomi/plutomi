import { signOut, useSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";

export default function Page() {
  const [session, loading] = useSession();
  const { error } = useRouter().query;

  return (
    <>
      {!session && (
        <>
          Not signed in <br />
          <button onClick={() => signIn()}>Sign innnn</button>
        </>
      )}
      {error && <p>An error ocurred logging you in. Please try again.</p>}

      {session && (
        <>
          Signed in as {session?.user?.email} <br />
          <p>SESSION {JSON.stringify(session)}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </>
  );
}
