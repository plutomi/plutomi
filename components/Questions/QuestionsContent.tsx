import { PlusIcon } from '@heroicons/react/solid';
import Loader from '../Loader';
import useQuestionsInOrg from '../../SWR/useQuestionsInOrg';
import QuestionItem from './QuestionItem';
import { DynamoQuestion } from '../../types/dynamo';
import EmptyQuestionsState from './EmptyQuestionState';
import CreateQuestionModal from './CreateQuestionModal';
import useStore from '../../utils/store';
import UpdateQuestionModal from './UpdateQuestionModal';
import useOrgInfo from '../../SWR/useOrgInfo';
import useSelf from '../../SWR/useSelf';

export default function QuestionsContent() {
  const { user, isUserLoading, isUserError } = useSelf();
  const { org, isOrgLoading, isOrgError } = useOrgInfo(user?.orgId);
  const { orgQuestions, isOrgQuestionsLoading, isOrgQuestionsError } = useQuestionsInOrg();

  const openCreateQuestionModal = useStore((state) => state.openCreateQuestionModal);
  const currentQuestion = useStore((state) => state.currentQuestion);
  if (isOrgQuestionsLoading) {
    return <Loader text="Loading questions..." />;
  }

  if (orgQuestions?.length === 0) {
    return <EmptyQuestionsState />;
  }
  return (
    <div className="">
      <CreateQuestionModal />
      {orgQuestions?.length === 0 ? (
        <EmptyQuestionsState />
      ) : (
        <div>
          {' '}
          <UpdateQuestionModal question={currentQuestion} />
          <div className="flex-1 my-2 flex md:mt-0  items-center  md:flex-grow justify-center">
            <p className="mx-12">Total questions: {org?.totalQuestions || orgQuestions?.length}</p>
            <button
              onClick={openCreateQuestionModal}
              type="button"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Question
            </button>
          </div>
          <div>
            <ul className="divide-y divide-gray-200 mx-auto max-w-xl flex-col space-y-4   ">
              {orgQuestions?.map((question: DynamoQuestion) => (
                <QuestionItem key={question?.questionId} question={question} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
