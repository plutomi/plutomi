import { useState } from "react";
import { PencilAltIcon } from "@heroicons/react/outline";
import { TrashIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
export default function QuestionItem({
  question,
  new_questions,
  deleteQuestion,
}) {
  const setQuestionModal = useStore(
    (state: PlutomiState) => state.setQuestionModal
  );
  const [isHovering, setIsHovering] = useState(false);

  const handleDelete = (question_id: string) => {
    deleteQuestion(question_id);
  };

  // Essentially fill in all the details of the modal and then open it

  return (
    <li
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="px-4    bg-white hover:bg-sky-50 transition ease-in-out duration-300 flex justify-between"
    >
      <div className=" py-6 border-red-400 h-full relative focus-within:ring-2 focus-within:ring-blue-500">
        <h3 className="text-sm font-semibold text-gray-800">
          {/* <a href="#" className="hover:underline focus:outline-none"> */}
          {/* Extend touch target to entire panel */}
          <span className="absolute inset-0" aria-hidden="true" />
          {new_questions.indexOf(question) + 1}. {question.GSI1SK}
        </h3>
        {question.question_description ? (
          <p className="text-sm text-gray-600 line-clamp-2">
            {question.question_description}
          </p>
        ) : null}
      </div>

      {isHovering ? (
        <div className="flex justify-center items-center ">
          <button
            onClick={() => handleDelete(question.question_id)}
            className="rounded-full hover:bg-white text-red-500 transition ease-in-out duration-200 px-3 py-3 text-md"
          >
            <TrashIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() =>
              setQuestionModal({
                is_open: true,
                modal_mode: "EDIT",
                question_title: question.GSI1SK,
                question_description: question.question_description,
                question_id: question.question_id,
              })
            }
            className="rounded-full hover:bg-white text-blue-500 transition ease-in-out duration-200 px-3 py-3 text-md"
          >
            <PencilAltIcon className="w-6 h-6" />
          </button>
        </div>
      ) : null}
    </li>
  );
}
