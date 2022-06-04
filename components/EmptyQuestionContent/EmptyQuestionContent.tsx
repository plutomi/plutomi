import { PlusIcon } from '@heroicons/react/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/outline';
import useStore from '../../utils/store';
import { CreateQuestionModal } from '../CreateQuestionModal';

export const EmptyQuestionContent = () => {
  const openCreateQuestionModal = useStore((state) => state.openCreateQuestionModal);
  return (
    <div className="text-center">
      <CreateQuestionModal />
      <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-light" />
      <h3 className="mt-2 text-lg font-medium text-dark">You don&apos;t have any questions</h3>
      <p className="mt-1 text-lg text-normal">Get started by creating a new one!</p>
      <div className="mt-6">
        <button
          type="button"
          onClick={openCreateQuestionModal}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Question
        </button>
      </div>
    </div>
  );
};
