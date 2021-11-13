import ApplicantListItem from "./ApplicantListItem";
import _ from "lodash";
import { useRouter } from "next/router";
import Loader from "../Loader";
import useStore from "../../utils/store";
import useAllApplicantsInStage from "../../SWR/useAllApplicantsInStage";
export default function ApplicantList() {
  const router = useRouter();
  const { openingId, stageId } = router.query as CustomQuery;
  const { applicants, isApplicantsLoading, isApplicantsError } =
    useAllApplicantsInStage(openingId, stageId);

  const setApplicantProfileModal = useStore(
    (store) => store.setApplicantProfileModal
  );

  const applicantProfileModal = useStore(
    (store) => store.applicantProfileModal
  );

  if (isApplicantsLoading) {
    return <Loader text="Loading applicants..." />;
  }

  if (applicants.length == 0) {
    return (
      <h1 className="text-2xl font-semibold text-normal">
        No applicants in this stage
      </h1>
    );
  }

  const handleApplicantClick = (applicantId: string) => {
    router.push(
      {
        pathname: `/openings/${openingId}/stages/${stageId}/applicants`,
        query: { applicantId: applicantId },
      },
      undefined,
      { shallow: true }
    );
    setApplicantProfileModal({
      ...applicantProfileModal,
      isModalOpen: true,
      applicantId: applicantId,
    });
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {applicants?.map((applicant: DynamoApplicant) => (
          <ApplicantListItem
            key={applicant.applicantId}
            applicant={applicant}
            handleApplicantClick={handleApplicantClick}
          />
        ))}
      </ul>
    </div>
  );
}
