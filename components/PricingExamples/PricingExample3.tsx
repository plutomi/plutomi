import NumberFormat from "react-number-format";

import {
  SparklesIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  IdentificationIcon,
} from "@heroicons/react/outline";

const stages = [
  {
    id: 1,
    name: "Waiting List",
    applicants: 81587,
    price: 5, // Cents
    icon: ClockIcon,
    change: "122",
    changeType: "increase",
    bgColor: `bg-blue-gray-100`,
    textColor: `text-blue-gray-600`,
    stageType: "Idle Stage",
  },
  {
    id: 2,
    name: "Set Up Profile",
    applicants: 1642,
    price: 25,
    icon: QuestionMarkCircleIcon,
    change: "5.4%",
    changeType: "increase",
    stageType: "Active Stage",
    bgColor: `bg-orange-100`,
    textColor: `text-orange-600`,
  },
  {
    id: 3,
    name: "License Upload",
    applicants: 351,
    price: 25,
    icon: IdentificationIcon,
    change: "3.2%",
    changeType: "decrease",
    stageType: "Active Stage",
    bgColor: `bg-orange-100`,
    textColor: `text-orange-600`,
  },
  {
    id: 4,
    name: "Contracted",
    applicants: 113,
    price: 100,
    icon: SparklesIcon,
    change: "3.2%",
    changeType: "decrease",
    stageType: "Frozen Stage",
    bgColor: `bg-cyan-100`,
    textColor: `text-cyan-600`,
  },
];

export default function Example() {
  const totalPrice = () => {
    let price = 0;
    let totalPrice = stages.forEach((stage) => {
      price += stage.applicants * stage.price;
    });
    return price / 100;
  };

  const getTotalApplicants = () => {
    return stages.reduce((a, b) => {
      return a + b.applicants;
    }, 0);
  };
  return (
    <div className="">
      <h3 className="text-xl leading-6 font-medium text-blue-gray-900">
        Example 3{" "}
      </h3>

      <dl className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {stages.map((item) => (
          <div key={item.id}>
            <div className="relative text-center bg-white  pt-5 px-2  pb-12 sm:pt-6 sm:px-6 border border-blue-gray-200 rounded-lg overflow-hidden">
              <dt>
                <p className=" text-lg font-medium text-blue-gray-900 truncate">
                  {item.name}
                </p>
              </dt>
              <dd className="flex items-center mb-4  justify-center">
                <div className="space-x-2 flex  mt-1 items-center text-blue-gray-500">
                  <UserGroupIcon className="w-5 h-5 0" />
                  <p className="text-xl font-semibold ">
                    <NumberFormat
                      value={item.applicants}
                      thousandSeparator={true}
                      displayType={"text"}
                    />
                  </p>
                </div>

                <div
                  className={`absolute bottom-0 inset-x-0 ${item.bgColor} px-4 py-4 sm:px-6`}
                >
                  <div className="text-lg md:text-base">
                    <p className={`font-bold ${item.textColor} text-center`}>
                      {item.stageType}
                    </p>
                  </div>
                </div>
              </dd>
            </div>

            <p className="mt-3 text-medium text-blue-gray-500 text-center">
              <NumberFormat
                value={item.applicants}
                thousandSeparator={true}
                displayType={"text"}
              />{" "}
              x{" "}
              <NumberFormat
                value={item.price / 100}
                thousandSeparator={true}
                displayType={"text"}
                decimalScale={2}
                fixedDecimalScale
                prefix={"$"}
              />{" "}
              ={" "}
              <NumberFormat
                value={(item.applicants * item.price) / 100}
                thousandSeparator={true}
                displayType={"text"}
                decimalScale={2}
                fixedDecimalScale
                prefix={"$"}
              />
            </p>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 text-lg leading-6 font-medium text-blue-gray-900 text-center lg:text-left">
        Total:{" "}
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
    </div>
  );
}
