import {
  CalendarIcon,
  LocationMarkerIcon,
  UsersIcon,
} from "@heroicons/react/solid";
import ClickToCopy from "../ClickToCopy";
import { GetRelativeTime } from "../../utils/time";
import ApplicantListItem from "./ApplicantListItem";
import _ from "lodash";
import { useRouter } from "next/router";
import Loader from "../Loader";
import ApplicantProfileModal from "./ApplicantProfileModal";
import useStore from "../../utils/store";
import useAllApplicantsInStage from "../../SWR/useAllApplicantsInStage";
export default function ApplicantList() {
  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const { applicants, isApplicantsLoading, isApplicantsError } =
    useAllApplicantsInStage(opening_id as string, stage_id as string);

  const setApplicantProfileModal = useStore(
    (store: PlutomiState) => store.setApplicantProfileModal
  );

  const applicantProfileModal = useStore(
    (store: PlutomiState) => store.applicantProfileModal
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

  const handleApplicantClick = (applicant_id: string) => {
    router.push(
      {
        pathname: `/openings/${opening_id}/stages/${stage_id}/applicants`,
        query: { applicant_id: applicant_id },
      },
      undefined,
      { shallow: true }
    );
    setApplicantProfileModal({
      ...applicantProfileModal,
      is_modal_open: true,
      applicant_id: applicant_id,
    });
  };
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ApplicantProfileModal />
      <ul role="list" className="divide-y divide-gray-200">
        {applicants?.map((applicant: DynamoApplicant) => (
          <ApplicantListItem
            key={applicant.applicant_id}
            applicant={applicant}
            handleApplicantClick={handleApplicantClick}
          />
        ))}
      </ul>
    </div>
  );
}
