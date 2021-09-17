import { UserGroupIcon } from "@heroicons/react/outline";
import NumberFormat from "react-number-format";
import {
  ApplicantPrices,
  StageBackgroundColors,
  StageTextColors,
} from "../../Config";

export default function Box({ stage_title, num_applicants, stage_type }) {
  return (
    <div>
      <div className="relative text-center bg-white  pt-5 px-2  pb-12 sm:pt-6 sm:px-6 border border-blue-gray-200 rounded-lg overflow-hidden">
        <dt>
          <p className=" text-lg font-medium text-blue-gray-900 ">
            {stage_title}
          </p>
        </dt>
        <dd className="flex items-center mb-4  justify-center">
          <div className="space-x-2 flex  mt-1 items-center text-blue-gray-500">
            <UserGroupIcon className="w-5 h-5 0" />
            <p className="text-xl font-semibold ">
              <NumberFormat
                value={num_applicants}
                thousandSeparator={true}
                displayType={"text"}
              />
            </p>
          </div>

          <div
            className={`absolute bottom-0 inset-x-0 ${StageBackgroundColors[stage_type]} px-4 py-4 sm:px-6`}
          >
            <div className="text-xl md:text-base">
              <p
                className={`capitalize font-semibold ${StageTextColors[stage_type]} text-center`}
              >
                {stage_type} Stage
              </p>
            </div>
          </div>
        </dd>
      </div>

      <p className="mt-3 text-medium text-blue-gray-500 text-center">
        <NumberFormat
          value={num_applicants}
          thousandSeparator={true}
          displayType={"text"}
        />{" "}
        x{" "}
        <NumberFormat
          value={ApplicantPrices[stage_type] / 100}
          thousandSeparator={true}
          displayType={"text"}
          decimalScale={2}
          fixedDecimalScale
          prefix={"$"}
        />{" "}
        ={" "}
        <NumberFormat
          value={(num_applicants * ApplicantPrices[stage_type]) / 100}
          thousandSeparator={true}
          displayType={"text"}
          decimalScale={2}
          fixedDecimalScale
          prefix={"$"}
        />
      </p>
    </div>
  );
}
