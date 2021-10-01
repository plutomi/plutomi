import { useRouter } from "next/router";
import useAllPublicOpenings from "../../SWR/useAllPublicOpenings";
import SignIn from "../../components/SignIn";
import axios from "axios";
import { mutate } from "swr";
import usePublicOrgById from "../../SWR/usePublicOrgById";
import ApplyPageHeader from "../../components/ApplyPage/ApplyPageHeader";
export default function Apply() {
  const router = useRouter();
  const { org_id } = router.query;
  const { publicOpenings, isPublicOpeningsLoading, isPublicOpeningsError } =
    useAllPublicOpenings(org_id as string);
  const { org, isOrgLoading, isOrgError } = usePublicOrgById(org_id as string);

  return (
    <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
      <header>
        <ApplyPageHeader />
      </header>

      <main className="mt-5">
        {/* Make this it's own component */}
        <div>
          <h1>All openings</h1>
          <div>
            {isPublicOpeningsLoading ? (
              <h1>Loading</h1>
            ) : (
              <div>
                {publicOpenings.length > 0 ? (
                  <div>
                    {publicOpenings.map((opening: DynamoOpening) => {
                      return (
                        <h1 key={opening?.opening_id}>{opening.GSI1SK}</h1>
                      );
                    })}
                  </div>
                ) : (
                  <h1>No opeinings found</h1>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
