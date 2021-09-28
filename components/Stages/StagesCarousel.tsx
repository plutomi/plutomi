import React, { useState } from "react";
import ItemsCarousel from "react-items-carousel";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import { ArrowRightIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import StageCard from "./StageCard";

const items = [
  { id: "j2938e", name: "Waitlist" },
  { id: "dn29u", name: "Questionnaire" },
  { id: "ni23", name: "Set Up Profile" },
  { id: "nsicu", name: "Driver's License Upload And checking if things exist" },
  { id: "ndi2", name: "Insurance Upload" },
  { id: "ndo3u2", name: "Background Check" },
  { id: "dno2i", name: "Contract Signing" },
  { id: "m1o", name: "Final Review" },
  { id: "dnou2", name: "Onboarding" },
  { id: "ndu1", name: "Set Up Direct Despoit" },
  { id: "nd1iu3", name: "Ready to Drive" },
  { id: "jd8s0a", name: "On Hold" },
  { id: "n1j", name: "Rejected" },
];

export default function StageCarousel() {
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
        {items.map((item) => (
          <div
            key={item.id}
            className={item.id == (stage_id as string) ? "mx-9" : "mx-9  "}
          >
            <StageCard name={item.name} stage_id={item.id} />
          </div>
        ))}
      </ItemsCarousel>
    </div>
  );
}
