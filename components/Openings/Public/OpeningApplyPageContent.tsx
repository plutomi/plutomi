import { useRouter } from 'next/router';
import usePublicOpeningById from '../../../SWR/usePublicOpeningById';
import Loader from '../../Loader';
import ApplicantInfoForm from './ApplicantInfoForm';
import { CustomQuery } from '../../../types/main';

export default function OpeningApplyPageContent() {
  const router = useRouter();
  const { orgId, openingId } = router.query as Pick<CustomQuery, 'openingId' | 'orgId'>;
  const { opening, isOpeningLoading, isOpeningError } = usePublicOpeningById(orgId, openingId);

  if (isOpeningLoading) {
    return <Loader text="Loading..." />;
  }

  return (
    <div className="">
      <ApplicantInfoForm />
    </div>
  );
}
