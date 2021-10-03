import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import useUser from "../../SWR/useUser";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import { PlusIcon, TrashIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import useOpeningById from "../../SWR/useOpeningById";
import { useState } from "react";
import Breadcrumbs from "../Breadcrumbs";
import { useRouter } from "next/router";
import Loader from "../Loader";
import { PencilAltIcon } from "@heroicons/react/outline";
import useStageById from "../../SWR/useStageById";
export default function StageSettingsHeader({ deleteStage }) {
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

  const setQuestionModal = useStore(
    (state: PlutomiState) => state.setQuestionModal
  );

  const setStageModal = useStore((state: PlutomiState) => state.setStageModal);

  // return (
  //   <div className="md:flex md:items-center md:justify-between ">
  //     <div className=" min-w-0 ">
  //       <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
  //         {opening?.GSI1SK}
  //       </h2>
  //     </div>
  //     <div className="space-x-4">
  //       <button
  //         type="button"
  //         onClick={() =>
  //           setQuestionModal({
  //             is_modal_open: true,
  //             modal_mode: "CREATE",
  //             question_id: "",
  //             question_description: "",
  //             GSI1SK: "",
  //           })
  //         }
  //         className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  //       >
  //         <PlusIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
  //         Add a question
  //       </button>
  //       <button
  //         type="button"
  //         onClick={() => deleteStage()}
  //         className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-red-500 text-red-500 bg-white hover:bg-red-500 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
  //       >
  //         <TrashIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
  //         Delete Stage
  //       </button>
  //     </div>
  //   </div>
  // );

  const crumbs = [
    {
      name: "Applicants",
      // Go to the CURRENT STAGE in the opening to view the applicants
      href: `/openings/${opening_id}/stages/${stage_id}/applicants`, // TODO should this end with applicants?
      current: false,
    },
    {
      name: "Opening Settings",
      href: `/openings/${opening_id}/settings`,
      current: false,
    },
    {
      name: "Stage Settings",
      href: `/openings/${opening_id}/stages/${stage_id}/settings`,
      current: true,
    },
  ];

  return (
    <div className="md:flex md:items-center md:justify-between ">
      <div className=" min-w-0 flex flex-col items-start ">
        <Breadcrumbs crumbs={crumbs} />
      </div>

      <div className="space-x-4 flex items-center">
        <button
          type="button"
          onClick={() =>
            setStageModal({
              is_modal_open: true,
              modal_mode: "EDIT",
              stage_id: stage_id,
              GSI1SK: stage?.GSI1SK,
            })
          }
          className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PencilAltIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Edit Stage
        </button>
        <button
          type="button"
          onClick={() =>
            setQuestionModal({
              is_modal_open: true,
              modal_mode: "CREATE",
              stage_id: stage_id,
              GSI1SK: "",
              question_id: "",
              question_description: "",
            })
          }
          className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-blue-500 text-white bg-blue-500 hover:bg-blue-800 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Add Question
        </button>
        <button
          onClick={() => deleteStage()}
          className="rounded-full hover:bg-red-500 hover:text-white border border-red-500 text-red-500 transition ease-in-out duration-200 px-2 py-2 text-md"
        >
          <TrashIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
