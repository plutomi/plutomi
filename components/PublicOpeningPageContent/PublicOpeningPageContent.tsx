import { useRouter } from 'next/router';
import usePublicOpeningById from '../../SWR/usePublicOpeningById';
import { CustomQuery } from '../../types/main';
import { Loader } from '../Loader';
import { PublicApplicantInfoForm } from '../PublicApplicantInfoForm';

export const PublicOpeningPageContent = () => {
  const router = useRouter();
  const { orgId, openingId } = router.query as Pick<CustomQuery, 'openingId' | 'orgId'>;
  const { opening, isOpeningLoading, isOpeningError } = usePublicOpeningById(orgId, openingId);

  if (isOpeningLoading) {
    return <Loader text="Loading..." />;
  }

  return (
    <div className="">
      <PublicApplicantInfoForm />
    </div>
  );
};
