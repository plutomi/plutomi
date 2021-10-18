import useApplicantById from "../../SWR/useApplicantById";
import { useRouter } from "next/router";
import Loader from "../Loader";
import { useState } from "react";
import useAllStageQuestions from "../../SWR/useAllStageQuestions";
import { nanoid } from "nanoid";
export default function ApplicationContent() {
  const [answers, setAnswers] = useState([]);

  const router = useRouter();
  const { org_id, applicant_id } = router.query;
  const { applicant, isApplicantLoading, isApplicantError } = useApplicantById(
    applicant_id as string
  );

  const { questions, isQuestionsLoading, isQuestionsError } =
    useAllStageQuestions(
      org_id as string,
      applicant?.current_opening_id,
      applicant?.current_stage_id
    );
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
    answer: string
  ) => {
    const incoming = {
      question_id: question_id,
      question_title: question_title,
      question_description: question_description,
      answer: answer,
    };
    const question_order = questions.map((a) => a.question_id);
    const question_index = question_order.indexOf(question_id);

    let found = answers.find((answer) => answer.question_id === question_id);
    let new_answers = [...answers];

    // Add answer
    if (!found) {
      new_answers.splice(question_index, 0, incoming);
      setAnswers(new_answers);
    }

    const answer_index = answers.indexOf(found);

    // Delete answer
    if (!answer || answer.length == 0) {
      new_answers.splice(answer_index, 1);
      setAnswers(new_answers);
      return;
    }

    // Replace answer
    new_answers.splice(question_index, 1, incoming);
    setAnswers(new_answers);
  };

  return (
    <div>
      <ul className="my-4 space-y-8">
        {questions.map((question: DynamoStageQuestion) => (
          <li key={question.question_id} className="space-y-1 mb-4">
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
    </div>
  );
}
