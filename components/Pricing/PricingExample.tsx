import NumberFormat from "react-number-format";
import { ApplicantPrices } from "./../../Config";
import PricingExampleBox from "./PricingExampleBox";
export default function Example({ stages, name }) {
  return (
    <div className="relative my-8 mx-auto text-center lg:max-w-full max-w-sm ">
      <h3 className="text-2xl leading-6 font-medium text-blue-gray-900">
        {name}
      </h3>

      <div className="my-4 grid grid-cols-1 gap-4 lg:grid-cols-5 mx-12 lg:mx-auto">
        {stages.map((stage) => (
          <PricingExampleBox
            key={stage.id}
            stage_title={stage.name}
            num_applicants={stage.applicants}
          />
        ))}
      </div>
    </div>
  );
}
