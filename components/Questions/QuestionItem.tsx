import { useState } from "react";
import { PencilAltIcon } from "@heroicons/react/outline";
import { TrashIcon } from "@heroicons/react/outline";
import {
  DeleteQuestionFromOrg,
  GetQuestionsInOrgURL,
} from "../../adapters/Questions";
import useStore from "../../utils/store";
import { mutate } from "swr";
import { DynamoNewQuestion } from "../../types/dynamo";
import UpdateQuestionModal from "./UpdateQuestionModal";

export default function QuestionItem({
  question,
}: {
  question: DynamoNewQuestion;
}) {
  const setCurrentQuestion = useStore((state) => state.setCurrentQuestion);
  const openUpdateQuestionModal = useStore(
    (state) => state.openUpdateQuestionModal
  );

  const handleEdit = () => {
    setCurrentQuestion(question);
    openUpdateQuestionModal();
  };

  const [isHovering, setIsHovering] = useState(false);

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }
    try {
      const data = await DeleteQuestionFromOrg(questionId);
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
      className="border rounded-lg shadow-sm px-4 py-2max-w-lg mx-auto my-2 bg-white hover:bg-sky-50 transition ease-in-out duration-300 flex justify-between"
    >
      <div className=" py-2  h-full relative focus-within:ring-2 focus-within:ring-blue-500">
        <h3 className="text-lg font-semibold text-dark">
          <span className="absolute inset-0" aria-hidden="true" />
          {question?.GSI1SK}
        </h3>
        {question?.description && (
          <p className="text-md text-light line-clamp-2 mt-1">
            {question?.description}
          </p>
        )}
        <p className="text-md text-red-300 line-clamp-2 mt-1">
          ID: {question?.questionId}
        </p>
      </div>
      <div className="flex justify-center items-center ">
        <button
          onClick={handleEdit}
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

      {/* {isHovering && (
 TODO
      )} */}
    </li>
  );
}
