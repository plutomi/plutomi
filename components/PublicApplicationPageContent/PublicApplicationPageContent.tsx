import { useRouter } from 'next/router';
import { useState } from 'react';
import { useQuestionsInOrg } from '../../SWR/useQuestionsInOrg';
import { AnswerQuestions } from '../../adapters/Applicants';
import { CustomQuery } from '../../types/main';
import { Loader } from '../Loader/Loader';

export const PublicApplicationPageContent = () => {
  const [responses, setResponses] = useState([]);

  const router = useRouter();
  const { orgId, applicantId } = router.query as Pick<CustomQuery, 'orgId' | 'applicantId'>;

  const { orgQuestions, isOrgQuestionsLoading, isOrgQuestionsError } = useQuestionsInOrg();
  if (isOrgQuestionsError) return <h1>An error ocurred retrieving questions in org</h1>;
  if (isOrgQuestionsLoading) return <Loader text="Loading questions..." />;
  if (!orgQuestions.length) return <h1>There are no questions in this stage :T</h1>;

  const handleAnswerChange = async (
    questionId: string,
    questionTitle: string,
    description: string,
    response: string,
  ) => {
    const incoming = {
      questionId,
      questionTitle,
      description,
      questionResponse: response,
    };
    const questionOrder = orgQuestions.map((a) => a.questionId);
    const questionIndex = questionOrder.indexOf(questionId);

    const found = responses.find((answer) => answer.questionId === questionId);
    const newResponses = [...responses];

    // Add answer
    if (!found) {
      newResponses.splice(questionIndex, 0, incoming);
      setResponses(newResponses);
    }

    const responseIndex = responses.indexOf(found);

    // Delete answer
    if (!response || !response.length) {
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
      console.log('Responses are', responses);
      const { data } = await AnswerQuestions(applicantId, responses);
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div>
      <ul className="my-4 space-y-8">
        {orgQuestions.map((question) => (
          <li key={question?.questionId} className="space-y-1 mb-4">
            <label htmlFor="email" className="block text-lg font-medium text-dark">
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
                    question?.description,
                    e.target.value,
                  )
                }
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <p className="mt-2 text-sm text-light">{question?.description}</p>
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
};
