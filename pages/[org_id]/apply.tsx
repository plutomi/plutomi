import { useRouter } from "next/router";
import useAllPublicOpenings from "../../SWR/useAllPublicOpenings";

export default function Apply() {
  const router = useRouter();
  const { org_id } = router.query;
  const { publicOpenings, isPublicOpeningsLoading, isPublicOpeningsError } =
    useAllPublicOpenings(org_id as string);

  return (
    <div>
      <h1>Viewing the {org_id} page</h1>
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
    </div>
  );
}
