import { useRouter } from 'next/router';
import { Loader } from '../../../../components/Loader';
import { PublicApplicationPageContent } from '../../../../components/PublicApplicationPageContent';
import { PublicApplicationPageHeader } from '../../../../components/PublicApplicationPageHeader';
import { useApplicantById } from '../../../../SWR/useApplicantById';
import { CustomQuery } from '../../../../types/main';

export default function Application() {
  const router = useRouter();
  const { applicantId } = router.query as Pick<CustomQuery, 'applicantId'>;
  const { applicant, isApplicantLoading, isApplicantError } = useApplicantById({ applicantId });

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined') {
    <Loader text="Loading ..." />;
  }

  if (isApplicantError) return <h1>An error ocurred loading your info</h1>;
  if (isApplicantLoading) return <Loader text="Loading info..." />;

  return (
    <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
      {!applicant ? (
        <h1 className="text-4xl mx-auto p-20">
          Hmm... That link doesn&apos;t seem right.. check it again!
        </h1>
      ) : (
        <>
          <header>
            <PublicApplicationPageHeader />
          </header>

          <main className="mt-5">
            <PublicApplicationPageContent />
          </main>
        </>
      )}
    </div>
  );
}
