import useApplicantById from "../../SWR/useApplicantById";
import { useRouter } from "next/router";
import Loader from "../Loader";
import useAllStageQuestions from "../../SWR/useAllStageQuestions";
export default function ApplicationContent() {
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
                name="email"
                id="email"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                aria-describedby="email-description"
              />
            </div>
            <p className="mt-2 text-sm text-light" id="email-description">
              {question?.question_description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
