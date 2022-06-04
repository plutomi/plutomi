import { CalendarIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import Link from 'next/link';
import * as Time from '../../utils/time';
import useStore from '../../utils/store';
import { CustomQuery } from '../../types/main';
import { DynamoApplicant } from '../../types/dynamo';
import { ClickToCopy } from '../ClickToCopy';

interface ApplicantListItemProps {
  applicant: DynamoApplicant;
}

export const ApplicantListItem = ({ applicant }: ApplicantListItemProps) => {
  const router = useRouter();
  const openApplicantProfileModal = useStore((state) => state.openApplicantProfileModal);
  const { openingId, stageId } = router.query as Pick<CustomQuery, 'openingId' | 'stageId'>;
  // TODO move this to applicant list item
  const handleApplicantClick = (applicantId: string) => {
    router.push(
      {
        pathname: `/openings/${openingId}/stages/${stageId}/applicants`,
        query: { applicantId },
      },
      undefined,
      { shallow: true },
    );
    openApplicantProfileModal();
  };

  return (
    <Link passHref href="##">
      <a href="##" onClick={() => handleApplicantClick(applicant.applicantId)}>
        <li className="cursor-pointer block hover:bg-gray-50">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-medium text-blue-600 truncate">
                {applicant.firstName} {applicant.lastName}
              </h1>
              <div className="ml-2 flex-shrink-0 flex">
                {applicant.isEmailVerified ? (
                  <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Email Verified
                  </p>
                ) : (
                  <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-gray-100 text-blue-gray-800">
                    Pending Verification
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-lg text-normal">{applicant.email}</p>

                <p className="mt-2 flex items-center text-lg text-normal sm:mt-0 sm:ml-2 ">
                  <ClickToCopy showText="Copy Email" copyText={applicant.email} />
                </p>
              </div>
              <div className="mt-2 flex items-center text-md text-normal sm:mt-0">
                <CalendarIcon
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-light"
                  aria-hidden="true"
                />
                <p>
                  Applied{' '}
                  <time dateTime={applicant.createdAt}>{Time.relative(applicant.createdAt)}</time>
                </p>
              </div>
            </div>
          </div>
        </li>
      </a>
    </Link>
  );
};
