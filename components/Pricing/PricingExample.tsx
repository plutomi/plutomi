import NumberFormat from "react-number-format";
import { ApplicantPrices } from "./../../Config";
import PricingExampleBox from "./PricingExampleBox";
export default function Example({ id, stages, name }) {
  const totalPrice = () => {
    let price = 0;
    stages.forEach((stage) => {
      price += stage.applicants * ApplicantPrices[stage.type];
    });
    return price / 100;
  };

  return (
    <div className="">
      <h3 className="text-xl leading-6 font-medium text-blue-gray-900">
        {name} -{" "}
        <NumberFormat
          className="font-bold"
          value={totalPrice()}
          displayType={"text"}
          decimalScale={2}
          thousandSeparator={true}
          fixedDecimalScale
          prefix={"$"}
        />
      </h3>

      <div className="my-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {stages.map((stage) => (
          <PricingExampleBox
            key={stage.id}
            stage_type={stage.type}
            stage_title={stage.name}
            num_applicants={stage.applicants}
          />
        ))}
      </div>

      {/* <h3 className=" text-lg leading-6 font-medium text-blue-gray-900 text-center lg:text-left">
        Total:{" "}

      </h3> */}
    </div>
  );
}
