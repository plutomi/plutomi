import useSelf from "../../SWR/useSelf";
import { PlusIcon, TrashIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import useOpeningById from "../../SWR/useOpeningById";
import Breadcrumbs from "../Breadcrumbs";
import { useRouter } from "next/router";
import { PencilAltIcon } from "@heroicons/react/outline";
import useStageById from "../../SWR/useStageById";
import * as Time from "../../utils/time";
import { CUSTOM_QUERY } from "../../types/main";
export default function StageSettingsHeader({ deleteStage }) {
  const router = useRouter();
  const { openingId, stageId } = router.query as Pick<
    CUSTOM_QUERY,
    "openingId" | "stageId"
  >;

  const { stage, isStageLoading, isStageError } = useStageById(stageId);

  const setQuestionModal = useStore((state) => state.setQuestionModal);

  const setStageModal = useStore((state) => state.setStageModal);

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
  //             isModalOpen: true,
  //             modalMode: "CREATE",
  //             questionId: "",
  //             questionDescription: "",
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
      // Go to the CURRENT ${ENTITY_TYPES.STAGE} in the opening to view the applicants
      href: `/openings/${openingId}/stages/${stageId}/applicants`, // TODO should this end with applicants?
      current: false,
    },
    {
      name: "Opening Settings",
      href: `/openings/${openingId}/settings`,
      current: false,
    },
    {
      name: "Stage Settings",
      href: `/openings/${openingId}/stages/${stageId}/settings`,
      current: true,
    },
  ];

  return (
    <div className="md:flex md:items-center md:justify-between ">
      <div className=" min-w-0 flex flex-col items-start ">
        <Breadcrumbs crumbs={crumbs} />
      </div>

      <p className="text-md text-light text-center">
        Created {Time.relative(stage?.createdAt)}
      </p>
      <div className="space-x-4 flex items-center">
        <button
          type="button"
          onClick={() =>
            setStageModal({
              isModalOpen: true,
              modalMode: "EDIT",
              stageId: stageId,
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
              isModalOpen: true,
              modalMode: "CREATE",
              stageId: stageId,
              GSI1SK: "",
              questionId: "",
              questionDescription: "",
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
