import NumberFormat from 'react-number-format';
import router from 'next/router';
import { CustomQuery } from '../../types/main';
import { Stage } from '../../entities';
import { Draggable } from 'react-beautiful-dnd';
import Link from 'next/link';
import { UserGroupIcon } from '@heroicons/react/outline';

interface StageCardProps {
  stage: Stage;
  linkHref: string;
  index: number;
}

export const DraggableStageCard = ({ linkHref, stage, index }: StageCardProps) => {
  const urlParams = router.query as Pick<CustomQuery, 'stageId'>;

  // Note: If using a transition: transition ease-in-out duration-300 for like the background
  // https://stackoverflow.com/questions/59130533/items-jumping-when-dropping-on-react-beautiful-dnd
  const content = (
    <Draggable draggableId={stage.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className={`border my-4 shadow-xs py-4 text-center hover:border-blue-500   rounded-xl overflow-hidden shadow-md hover:shadow-lg  ${
            stage.id === urlParams.stageId
              ? ' bg-sky-50  border border-t-4 border-t-blue-500'
              : ' bg-white'
          }`}
        >
          <h5 className=" px-2 text-md font-medium text-dark truncate">{stage.name}</h5>
          <dd className="flex items-center  justify-center">
            <div className="space-x-2 flex  mt-1 items-center text-blue-gray-500">
              <UserGroupIcon className="w-5 h-5 0" />
              <p className="text-md font-semibold ">
                <NumberFormat value={stage.totalApplicants} thousandSeparator displayType="text" />
              </p>
            </div>
          </dd>
        </div>
      )}
    </Draggable>
  );

  return (
    <Link href={linkHref}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a>{content}</a>
    </Link>
  );
};
