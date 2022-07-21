import { useRouter } from 'next/router';
import { usePublicOpening } from '../../SWR/usePublicOpening';
import { CustomQuery } from '../../types/main';
import { Loader } from '../Loader';
import { PublicApplicantInfoForm } from '../PublicApplicantInfoForm';

export const PublicOpeningPageContent = () => {
  const router = useRouter();
  const { orgId, openingId } = router.query as Pick<CustomQuery, 'openingId' | 'orgId'>;
  const { opening, isOpeningLoading, isOpeningError } = usePublicOpening({ orgId, openingId });

  if (isOpeningError) return <h1>An error ocurred retrieving this opening</h1>;
  if (isOpeningLoading) return <Loader text="Loading..." />;

  return (
    <div className="">
      <PublicApplicantInfoForm />
    </div>
  );
};
