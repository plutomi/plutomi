import { useSession } from "next-auth/client";
import useSelf from "../../SWR/useSelf";
import useOrgUsers from "../../SWR/useOrgUsers";
import UserCard from "./UserCard";
import Loader from "../Loader";
export default function OpeningsContent() {
  const { user, isUserLoading, isUserError } = useSelf();

  const { orgUsers, isOrgUsersLoading, isOrgUsersError } = useOrgUsers(
    user?.org_id,
    user?.user_id
  );

  if (isOrgUsersLoading) {
    return <Loader text="Loading team..." />;
  }
  return (
    <>
      {orgUsers?.map((user: DynamoUser) => (
        <UserCard key={user.user_id} user={user} />
      ))}
    </>
  );
}
