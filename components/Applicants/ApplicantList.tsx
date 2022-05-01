import _ from 'lodash';
import { useRouter } from 'next/router';
import ApplicantListItem from './ApplicantListItem';
import Loader from '../Loader';
import useAllApplicantsInStage from '../../SWR/useAllApplicantsInStage';
import { CUSTOM_QUERY } from '../../types/main';
import { DynamoApplicant } from '../../types/dynamo';

export default function ApplicantList() {
  const router = useRouter();
  const { openingId, stageId } = router.query as Pick<CUSTOM_QUERY, 'openingId' | 'stageId'>;

  const { applicants, isApplicantsLoading, isApplicantsError } = useAllApplicantsInStage(
    openingId,
    stageId,
  );

  if (isApplicantsLoading) {
    return <Loader text="Loading applicants..." />;
  }

  if (isApplicantsError) {
    return <h1>An error ocurred retrieving your applicants: {isApplicantsError.message}</h1>;
  }

  if (applicants?.length === 0) {
    return <h1 className="text-2xl font-semibold text-normal">No applicants in this stage</h1>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {applicants?.map((applicant: DynamoApplicant) => (
          <ApplicantListItem key={applicant.applicantId} applicant={applicant} />
        ))}
      </ul>
    </div>
  );
}
