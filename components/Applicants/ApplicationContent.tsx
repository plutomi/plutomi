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

  return (
    <div>
      <ul className="my-4">
        {questions.map((question: DynamoStageQuestion) => (
          <li key={question.question_id} className="space-y-1 mb-4">
            <h4 className="text-lg text-dark">{question?.GSI1SK}</h4>
            <p className="text-sm text-light">
              {question?.question_description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
