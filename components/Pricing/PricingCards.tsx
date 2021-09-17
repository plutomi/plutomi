import NumberFormat from "react-number-format";
import { StageBackgroundColors, StageTextColors, ApplicantPrices } from "../../Config";
export default function PricingCard({
  stage_type,
  fee_type,
  description,
}) {
  return (
    <div className="shadow-md  block md:flex w-auto rounded-md  flex-col">
      <div
        className={`py-4 ${
          StageBackgroundColors[stage_type.toLowerCase()]
        } rounded-t-md`}
      >
        <p
          className={`text-2xl text-center font-semibold ${
            StageTextColors[stage_type.toLowerCase()]
          }`}
        >
          {stage_type} Stages
        </p>
      </div>
      <div className="bg-white p-8  text-center rounded-b-md ">
        <h3 className=" text-2xl font-extrabold text-blue-gray-900 sm:text-3xl">
          <div className=" space-x-4 flex flex-wrap items-center justify-center text-3xl lg:text-5xl font-extrabold text-blue-gray-900">
            <span className="w-full">
              {" "}
              <NumberFormat
                className="font-bold"
                value={ApplicantPrices[stage_type.toLowerCase()] / 100}
                displayType={"text"}
                decimalScale={2}
                thousandSeparator={true}
                fixedDecimalScale
                prefix={"$"}
              />
            </span>
            <span className="text-base md:text-lg  mt-2 font-normal text-blue-gray-500">
              {fee_type}
            </span>
          </div>
        </h3>
        {description}
      </div>
    </div>
  );
}
