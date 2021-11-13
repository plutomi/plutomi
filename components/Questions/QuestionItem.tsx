import { useState } from "react";
import { PencilAltIcon } from "@heroicons/react/outline";
import { TrashIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
export default function QuestionItem({
  question,
  newQuestions,
  deleteQuestion,
}) {
  const setQuestionModal = useStore((state) => state.setQuestionModal);
  const [isHovering, setIsHovering] = useState(false);

  const handleDelete = (questionId: string) => {
    deleteQuestion(questionId);
  };

  // Essentially fill in all the details of the modal and then open it

  return (
    <li
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="px-4    bg-white hover:bg-sky-50 transition ease-in-out duration-300 flex justify-between"
    >
      <div className=" py-6  h-full relative focus-within:ring-2 focus-within:ring-blue-500">
        <h3 className="text-lg font-semibold text-dark">
          {/* <a href="#" className="hover:underline focus:outline-none"> */}
          {/* Extend touch target to entire panel */}
          <span className="absolute inset-0" aria-hidden="true" />
          {newQuestions.indexOf(question) + 1}. {question.GSI1SK}
        </h3>
        {question.questionDescription && (
          <p className="text-md text-light line-clamp-2 mt-1">
            {question.questionDescription}
          </p>
        )}
      </div>

      {isHovering && (
        <div className="flex justify-center items-center ">
          <button
            onClick={() =>
              setQuestionModal({
                isModalOpen: true,
                modalMode: "EDIT",
                GSI1SK: question.GSI1SK,
                questionDescription: question.questionDescription,
                questionId: question?.questionId,
              })
            }
            className="rounded-full hover:bg-white text-blue-500 transition ease-in-out duration-200 px-3 py-3 text-md"
          >
            <PencilAltIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleDelete(question?.questionId)}
            className="rounded-full hover:bg-white text-red-500 transition ease-in-out duration-200 px-3 py-3 text-md"
          >
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>
      )}
    </li>
  );
}
