import { useState } from "react";
import { PencilAltIcon } from "@heroicons/react/outline";
import { TrashIcon } from "@heroicons/react/outline";
import { DeleteQuestion, GetQuestionsInOrgURL } from "../../adapters/Questions";
import useStore from "../../utils/store";
import { mutate } from "swr";
import { DynamoNewQuestion } from "../../types/dynamo";
export default function QuestionItem({
  question,
}: {
  question: DynamoNewQuestion;
}) {
  const openUpdateQuestionmodal = useStore(
    (state) => state.openUpdateQuestionmodal
  );
  const [isHovering, setIsHovering] = useState(false);

  const handleDelete = async (questionId: string) => {
    try {
      const data = await DeleteQuestion(questionId);
      alert(data.message);
      mutate(GetQuestionsInOrgURL());
    } catch (error) {
      alert(error.response.data.message);
    }
  };
  // Essentially fill in all the details of the modal and then open it
  return (
    <li
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="px-4 my-2 border-2 rounded-lg bg-white hover:bg-sky-50 transition ease-in-out duration-300 flex justify-between"
    >
      <div className=" py-2  h-full relative focus-within:ring-2 focus-within:ring-blue-500">
        <h3 className="text-lg font-semibold text-dark">
          {/* <a href="#" className="hover:underline focus:outline-none"> */}
          {/* Extend touch target to entire panel */}
          <span className="absolute inset-0" aria-hidden="true" />
          {question?.GSI1SK}
        </h3>
        {question?.description && (
          <p className="text-md text-light line-clamp-2 mt-1">
            {question?.description}
          </p>
        )}
        <p className="text-md text-red-300 line-clamp-2 mt-1">
          {question?.questionId}
        </p>
      </div>

      {isHovering && (
        <div className="flex justify-center items-center ">
          <button
            onClick={openUpdateQuestionmodal}
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
