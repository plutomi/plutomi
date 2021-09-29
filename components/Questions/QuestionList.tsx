import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningById from "../../SWR/useOpeningById";
import useStageById from "../../SWR/useStageById";
import useAllStageQuestions from "../../SWR/useAllStageQuestions";
import Loader from "../Loader";
export default function QuestionList() {
  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );

  const { stage, isStageLoading, isStageError } = useStageById(
    user?.user_id,
    opening?.opening_id,
    stage_id as string
  );

  const { questions, isQuestionsLoading, isQuestionsError } =
    useAllStageQuestions(user?.org_id, opening?.opening_id, stage?.stage_id);

  if (isQuestionsLoading) {
    return <Loader text={"Loading questions..."} />;
  }
  return (
    <div>
      <div className="flow-root mt-6">
        <ul role="list" className="-my-5 divide-y divide-gray-200">
          {questions?.map((question: DynamoStageQuestion) => (
            <li key={question.question_id} className="py-5">
              <div className="relative focus-within:ring-2 focus-within:ring-blue-500">
                <h3 className="text-sm font-semibold text-gray-800">
                  {/* <a href="#" className="hover:underline focus:outline-none"> */}
                  {/* Extend touch target to entire panel */}
                  <span className="absolute inset-0" aria-hidden="true" />
                  {question.GSI1SK}
                  {/* </a> */}
                </h3>
                {question.question_description ? (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {question.question_description}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
