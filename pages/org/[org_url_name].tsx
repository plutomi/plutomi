import { useRouter } from "next/router";

export default function NotFound() {
  const router = useRouter();

  // TODO get props client side and return 404 if org not found
  const { org_id } = router.query;
  return (
    <div>
      <h1>Welcome to {org_id}&apos;s profile</h1>
    </div>
  );
}
