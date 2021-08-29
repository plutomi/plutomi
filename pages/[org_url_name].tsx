import { useRouter } from "next/router";

export default function NotFound() {
  const router = useRouter();

  // TODO get props client side and return 404 if org not found
  const { org_url_name } = router.query;
  return (
    <div>
      <h1>Welcome to {org_url_name}&apos;s job board</h1>
    </div>
  );
}
