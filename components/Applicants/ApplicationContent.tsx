import usePublicApplicant from "../../SWR/usePublicApplicant";
import { useRouter } from "next/router";
import Loader from "../Loader";
import { useState } from "react";
import useAllStageQuestions from "../../SWR/useAllStageQuestions";
import { nanoid } from "nanoid";
import axios from "axios";
import ApplicantsService from "../../Adapters/ApplicantsService";
import { CUSTOM_QUERY } from "../../types/main";
export default function ApplicationContent() {
  const [responses, setResponses] = useState([]);

  const router = useRouter();
  const { orgId, applicantId } = router.query as Pick<
    CUSTOM_QUERY,
    "orgId" | "applicantId"
  >;
  const { applicant, isApplicantLoading, isApplicantError } =
    usePublicApplicant(applicantId);

  const { questions, isQuestionsLoading, isQuestionsError } =
    useAllStageQuestions(orgId, applicant?.stageId);
  if (isQuestionsLoading) {
    return <Loader text="Loading questions..." />;
  }

  if (questions.length == 0) {
    return <h1>There are no questions in this stage :T</h1>;
  }

  const handleAnswerChange = async (
    questionId: string,
    questionTitle: string,
    questionDescription: string,
    response: string
  ) => {
    const incoming = {
      questionId: questionId,
      questionTitle: questionTitle,
      questionDescription: questionDescription,
      questionResponse: response,
    };
    const questionOrder = questions.map((a) => a.questionId);
    const questionIndex = questionOrder.indexOf(questionId);

    let found = responses.find((answer) => answer.questionId === questionId);
    let newResponses = [...responses];

    // Add answer
    if (!found) {
      newResponses.splice(questionIndex, 0, incoming);
      setResponses(newResponses);
    }

    const responseIndex = responses.indexOf(found);

    // Delete answer
    if (!response || response.length == 0) {
      newResponses.splice(responseIndex, 1);
      setResponses(newResponses);
      return;
    }

    // Replace answer
    newResponses.splice(questionIndex, 1, incoming);
    setResponses(newResponses);
  };

  const handleSubmit = async () => {
    try {
      const { message } = await ApplicantsService.answerQuestions(
        orgId,
        applicantId,
        responses
      );
      alert(message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div>
      <ul className="my-4 space-y-8">
        {questions.map((question) => (
          <li key={question?.questionId} className="space-y-1 mb-4">
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
                    question?.questionId,
                    question?.GSI1SK,
                    question?.questionDescription,
                    e.target.value
                  )
                }
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <p className="mt-2 text-sm text-light">
              {question?.questionDescription}
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
