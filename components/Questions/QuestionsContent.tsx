import Loader from "../Loader";
import useAllQuestions from "../../SWR/useAllQuestions";
import QuestionItem from "./QuestionItem";
import { DynamoNewQuestion } from "../../types/dynamo";
import EmptyQuestionsState from "./EmptyQuestionState";
import CreateQuestionModal from "./CreateQuestionModal";
import useStore from "../../utils/store";
import CustomLink from "../../components/CustomLink";
import { PlusIcon } from "@heroicons/react/solid";
import UpdateQuestionModal from "./UpdateQuestionModal";
import { useState } from "react";
export default function QuestionsContent() {
  const { questions, isQuestionsLoading, isQuestionsError } = useAllQuestions();

  const openCreateQuestionModal = useStore(
    (state) => state.openCreateQuestionModal
  );
  const currentQuestion = useStore((state) => state.currentQuestion);
  if (isQuestionsLoading) {
    return <Loader text="Loading questions..." />;
  }

  return (
    <div className="">
      <h1 className="text-2xl text-red-500 bold">
        NOTE: page is being worked on
      </h1>

      <CustomLink
        url={"https://github.com/plutomi/plutomi/tree/question-keys"}
        text={"https://github.com/plutomi/plutomi/tree/question-keys"}
      />

      <CreateQuestionModal />
      {questions?.length === 0 ? (
        <EmptyQuestionsState />
      ) : (
        <div>
          {" "}
          <UpdateQuestionModal question={currentQuestion} />
          <div className="flex-1 my-2 flex md:mt-0  items-center  md:flex-grow justify-center">
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
            <ul
              role="list"
              className="divide-y divide-gray-200 mx-auto max-w-xl flex-col space-y-4   "
            >
              {questions?.map((question: DynamoNewQuestion) => (
                <QuestionItem key={question?.questionId} question={question} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
