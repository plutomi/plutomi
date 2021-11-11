import usePublicApplicant from "../../SWR/usePublicApplicant";
import { useRouter } from "next/router";
import Loader from "../Loader";
import { useState } from "react";
import useAllStageQuestions from "../../SWR/useAllStageQuestions";
import { nanoid } from "nanoid";
import axios from "axios";
import ApplicantsService from "../../adapters/ApplicantsService";
export default function ApplicationContent() {
  const [responses, setResponses] = useState([]);

  const router = useRouter();
  const { orgId, applicantId } = router.query as CustomQuery;
  const { applicant, isApplicantLoading, isApplicantError } =
    usePublicApplicant(applicantId);

  const { questions, isQuestionsLoading, isQuestionsError } =
    useAllStageQuestions(orgId, applicant?.currentStageId);
  if (isQuestionsLoading) {
    return <Loader text="Loading questions..." />;
  }

  if (questions.length == 0) {
    return <h1>There are no questions in this stage :T</h1>;
  }

  const handleAnswerChange = async (
    question_id: string,
    question_title: string,
    question_description: string,
    response: string
  ) => {
    const incoming: ApplicantAnswer = {
      question_id: question_id,
      question_title: question_title,
      question_description: question_description,
      question_response: response,
    };
    const question_order = questions.map((a) => a.question_id);
    const question_index = question_order.indexOf(question_id);

    let found = responses.find((answer) => answer.question_id === question_id);
    let new_responses = [...responses];

    // Add answer
    if (!found) {
      new_responses.splice(question_index, 0, incoming);
      setResponses(new_responses);
    }

    const response_index = responses.indexOf(found);

    // Delete answer
    if (!response || response.length == 0) {
      new_responses.splice(response_index, 1);
      setResponses(new_responses);
      return;
    }

    // Replace answer
    new_responses.splice(question_index, 1, incoming);
    setResponses(new_responses);
  };

  const handleSubmit = async () => {
    try {
      const { message } = await ApplicantsService.answerQuestions({
        orgId,
        applicantId,
        responses,
      });
      alert(message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div>
      <ul className="my-4 space-y-8">
        {questions.map((question: DynamoStageQuestion) => (
          <li key={question?.question_id} className="space-y-1 mb-4">
            <label
              htmlFor="email"
              className="block text-lg font-medium text-dark"
            >
              {question?.GSI1SK}
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="text"
                id="text"
                onChange={(e) =>
                  handleAnswerChange(
                    question?.question_id,
                    question?.GSI1SK,
                    question?.question_description,
                    e.target.value
                  )
                }
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <p className="mt-2 text-sm text-light">
              {question?.question_description}
            </p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => handleSubmit()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ease-in-out duration-200"
      >
        Submit
      </button>
    </div>
  );
}
