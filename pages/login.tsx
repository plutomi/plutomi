import { useRouter } from "next/router";
import { useEffect } from "react";
export default function Invites() {
  const router = useRouter();

  useEffect(() => {
    router.push(
      {
        pathname: `/dashboard`,
      },
      undefined,
      { shallow: true }
    );
  }, [router.isReady]);

  return <></>;
}
