import {
  CalendarIcon,
  LocationMarkerIcon,
  UsersIcon,
} from "@heroicons/react/solid";
import { useEffect } from "react";

import ClickToCopy from "../ClickToCopy";
import { GetRelativeTime } from "../../utils/time";
import ApplicantListItem from "./ApplicantListItem";
import _ from "lodash";
import { useRouter } from "next/router";
import Loader from "../Loader";
import ApplicantProfileModal from "./ApplicantProfileModal";
import useStore from "../../utils/store";
import useAllApplicantsInStage from "../../SWR/useAllApplicantsInStage";
import axios from "axios";
import { nanoid } from "nanoid/async";
import { mutate } from "swr";
import useApplicantById from "../../SWR/useApplicantById";
export default function ApplicantList() {
  const router = useRouter();
  const { opening_id, stage_id, applicant_id } = router.query;
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

  const randomUpdate = async (applicant_id: string) => {
    try {
      const first = await nanoid(10);
      const last = await nanoid(10);
      const new_applicant = {
        first_name: first,
        last_name: last,
        beans: true,
        full_name: `${first} ${last}`,
      };
      console.log(new_applicant);
      const body = {
        updated_applicant: new_applicant,
      };
      const { status, data } = await axios.put(
        `/api/applicants/${applicant_id}`,
        body
      );
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }

    // NOTE updating that single applicant wont work since the list is rendering old data
    // mutate(`/api/applicants/${applicant_id}`);
    // TODO In the future, might want to change this to only return the updated applicant
    mutate(`/api/openings/${opening_id}/stages/${stage_id}/applicants`);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="p-4 border rounded-md">
        {/* <button className="px-4 py-3 rounded-md bg-indigo-300 hover:bg-indigo-600 transition ease-in-out duration-200">
          Create Random Applicant
        </button> */}
        <button
          onClick={() => randomUpdate(applicants[0].applicant_id)}
          className="px-4 py-3 rounded-md bg-orange-300 hover:bg-orange-600 transition ease-in-out duration-200"
        >
          Update First Applicant
        </button>
      </div>
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
