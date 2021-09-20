import NumberFormat from "react-number-format";
import { ApplicantPrices } from "../../Config";

export default function PricingCard({ applicant_type, description }) {
  const bgColor =
    applicant_type.toLowerCase() === "idle"
      ? "bg-idle-light"
      : "bg-active-light";
  const textColor =
    applicant_type.toLowerCase() === "idle"
      ? "text-idle-dark"
      : "text-active-dark";

  return (
    <div className="shadow-md  block md:flex w-auto rounded-md  flex-col">
      <div className={`py-4 ${bgColor} rounded-t-md`}>
        <p className={`text-2xl text-center font-semibold ${textColor}`}>
          {applicant_type} Applicants
        </p>
      </div>
      <div className="bg-white p-8  text-center rounded-b-md ">
        <h3 className=" text-2xl font-extrabold text-normal sm:text-3xl">
          <div className=" space-x-4 flex flex-wrap items-center justify-center text-3xl lg:text-5xl font-extrabold text-normal">
            <span className="w-full">
              {" "}
              <NumberFormat
                className="font-bold text-idle-dark"
                value={ApplicantPrices[applicant_type.toLowerCase()] / 100}
                displayType={"text"}
                decimalScale={2}
                thousandSeparator={true}
                fixedDecimalScale
                prefix={"$"}
              />
            </span>
            <span className="text-base md:text-lg  mt-2 font-normal text-idle-dark">
              / per applicant / per month
            </span>
          </div>
        </h3>
        {description}
      </div>
    </div>
  );
}
