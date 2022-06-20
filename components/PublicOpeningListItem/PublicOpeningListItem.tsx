import { CalendarIcon, LocationMarkerIcon } from '@heroicons/react/outline';
import Link from 'next/dist/client/link';
import { DynamoOpening } from '../../types/dynamo';
import * as Time from '../../utils/time';

interface PublicOpeningListItemProps {
  opening: DynamoOpening;
}

export const PublicOpeningListItem = ({ opening }: PublicOpeningListItemProps) => (
  
  <li key={opening.openingId}>
    {/* Take applicant to opening info page */}
    <Link href={`/${opening?.orgId}/${opening?.openingId}/apply`}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium text-blue-600 truncate">{opening?.openingName}</p>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="mt-2 flex items-center text-lg text-normal sm:mt-0">
                <LocationMarkerIcon
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-light"
                  aria-hidden="true"
                />
                Location
              </p>
            </div>
            <div className="mt-2 flex items-center text-md text-normal sm:mt-0">
              <CalendarIcon
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-light"
                aria-hidden="true"
              />
              <p>
                Posted <time dateTime={opening.createdAt}>{Time.relative(opening.createdAt)}</time>
              </p>
            </div>
          </div>
        </div>
      </a>
    </Link>
  </li>
);
