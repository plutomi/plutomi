import React, { useState } from "react";
import ItemsCarousel from "react-items-carousel";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import { ArrowRightIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import StageCard from "./StageCard";
import Loader from "../Loader";
import useOpeningInfo from "../../SWR/useOpeningInfo";
import { CUSTOM_QUERY } from "../../types/main";
export default function StageCarousel() {
  const router = useRouter();
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const chevronWidth = 60;

  const { openingId } = router.query as Pick<CUSTOM_QUERY, "openingId">;

  let { opening, isOpeningLoading, isOpeningError } = useOpeningInfo(openingId);

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    opening?.openingId
  );

  if (isStagesLoading) {
    return <Loader text="Loading stages..." />;
  }

  return (
    <div className="max-w-8xl border -py-4 rounded-xl">
      <ItemsCarousel
        requestToChangeActive={setActiveItemIndex}
        activeItemIndex={activeItemIndex}
        numberOfCards={6}
        slidesToScroll={3}
        responsive={false}
        gutter={10}
        chevronWidth={chevronWidth}
        leftChevron={
          <button className="inline-flex  border rounded-l-xl bg-blue-300   hover:bg-blue-500  transition ease-in-out duration-200 w-full mx-1 px-2 justify-center items-center h-4/5 text-white">
            <ArrowLeftIcon className="h-10 w-10" aria-hidden="true" />
          </button>
        }
        rightChevron={
          <button className="inline-flex  border rounded-r-xl  bg-gradient-to-r  bg-blue-300 hover:bg-blue-500  transition ease-in-out duration-200 w-full mx-1 px-2 justify-center items-center h-4/5 text-white">
            <ArrowRightIcon className="h-10 w-10" aria-hidden="true" />
          </button>
        }
        outsideChevron
        firstAndLastGutter={true}
      >
        {stages?.map((stage) => (
          <StageCard
            key={stage.stageId}
            name={stage.GSI1SK}
            stageId={stage.stageId}
            totalApplicants={stage.totalApplicants}
            draggable={false}
            linkHref={`/openings/${openingId}/stages/${stage.stageId}/applicants`}
          />
        ))}
      </ItemsCarousel>
    </div>
  );
}
