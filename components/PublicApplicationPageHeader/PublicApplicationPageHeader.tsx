import { useRouter } from 'next/router';
import { useApplicantById } from '../../SWR/useApplicantById';
import { useStageInfo } from '../../SWR/useStageInfo';
import { CustomQuery } from '../../types/main';
import { Loader } from '../Loader';

export const PublicApplicationPageHeader = () => {
  const router = useRouter();
  const { applicantId } = router.query as Pick<CustomQuery, 'applicantId'>;
  const { applicant, isApplicantLoading, isApplicantError } = useApplicantById({ applicantId });

  const { stage, isStageLoading, isStageError } = useStageInfo({
    openingId: applicant?.openingId, // TODO needs refactoring
    stageId: applicant?.stageId, // TODO needs refactoring
  });

  if (isApplicantError) return <h1>An error ocurred loading your info</h1>;
  if (isStageError) return <h1>An error ocurred loading your current stage info</h1>;
  if (isApplicantLoading || isStageLoading) return <Loader text="Loading..." />;

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">Hello :)</h2>
        {/* <h2 className="text-lg mt-6 leading-7 text-normal sm:text-3xl sm:truncate">
          {stage?.GSI1SK}
        </h2> */}
      </div>
    </div>
  );
};
