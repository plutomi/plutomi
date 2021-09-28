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
    <div className=" max-w-8xl border rounded-xl py-4 mx-24">
      <ItemsCarousel
        requestToChangeActive={setActiveItemIndex}
        activeItemIndex={activeItemIndex}
        numberOfCards={6}
        slidesToScroll={3}
        gutter={-60}
        chevronWidth={chevronWidth}
        leftChevron={
          <button className="inline-flex  border rounded-l-xl bg-blue-gray-500  hover:bg-blue-gray-800 transition ease-in-out duration-200 w-full justify-center items-center h-full text-white">
            <ArrowLeftIcon className="h-10 w-10" aria-hidden="true" />
          </button>
        }
        rightChevron={
          <button className="inline-flex border rounded-r-xl bg-blue-gray-500 hover:bg-blue-gray-800 transition ease-in-out duration-200 w-full justify-center items-center h-full  text-white">
            <ArrowRightIcon className="h-10 w-10" aria-hidden="true" />
          </button>
        }
        outsideChevron
        firstAndLastGutter={false}
      >
        {stages?.map((stage: DynamoStage) => (
          <div
            key={stage.stage_id}
            className={
              stage.stage_id == (stage_id as string) ? "mx-9" : "mx-9  "
            }
          >
            <StageCard
              name={stage.GSI1SK}
              stage_id={stage.stage_id}
              opening_id={stage.opening_id}
            />
          </div>
        ))}
      </ItemsCarousel>
    </div>
  );
}
