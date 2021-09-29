import React, { useState } from "react";
import ItemsCarousel from "react-items-carousel";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import { ArrowRightIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import StageCard from "./StageCard";

export default function StageCarousel({ stages }) {
  const router = useRouter();
  const { stage_id } = router.query;
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const chevronWidth = 60;
  return (
    <div className="max-w-8xl border rounded-xl -py-4  ">
      <ItemsCarousel
        requestToChangeActive={setActiveItemIndex}
        activeItemIndex={activeItemIndex}
        numberOfCards={6}
        slidesToScroll={3}
        responsive={false}
        gutter={-60}
        chevronWidth={chevronWidth}
        leftChevron={
          <button className="inline-flex  border rounded-l-xl bg-blue-300   hover:bg-blue-500  transition ease-in-out duration-200 w-full justify-center items-center h-full text-white">
            <ArrowLeftIcon className="h-10 w-10" aria-hidden="true" />
          </button>
        }
        rightChevron={
          <button className="inline-flex  border rounded-r-xl bg-blue-300   hover:bg-blue-500  transition ease-in-out duration-200 w-full justify-center items-center h-full text-white">
            <ArrowRightIcon className="h-10 w-10" aria-hidden="true" />
          </button>
        }
        outsideChevron
        firstAndLastGutter={false}
      >
        {stages?.map((stage: DynamoStage) => (
          <div key={stage.stage_id} className={"mx-9 "}>
            <StageCard
              name={stage.GSI1SK}
              current_stage_id={stage.stage_id}
              opening_id={stage.opening_id}
            />
          </div>
        ))}
      </ItemsCarousel>
    </div>
  );
}
