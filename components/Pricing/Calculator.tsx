import { useState, useEffect } from "react";
import NumberFormat from "react-number-format";
import { random } from "lodash";
import { ApplicantPrices } from "../../Config";

export default function Calculator() {
  const [lowEnd, setLowEnd] = useState("100");
  const [highEnd, setHighEnd] = useState("100");

  const getRandom = () => random(parseInt(lowEnd), parseInt(highEnd));

  // TODO clean this up lol
  let newApplicants = Array.from({ length: 12 }, () => getRandom());
  let activeFees = newApplicants.map(
    (amount) => (amount * ApplicantPrices.active) / 100
  );

  let totalApplicants = [];
  newApplicants.reduce((a, b, i) => {
    return (totalApplicants[i] = a + b);
  }, 0);

  let idleArray = [];
  let idleFees = newApplicants.map((item, index) => {
    if (index < 6) {
      return newApplicants.slice(0, index).reduce((a, b) => {
        return (idleArray[index] = a + b);
      }, 0);
    }
    return newApplicants.slice(index - 6, index).reduce((a, b) => {
      return (idleArray[index] = a + b);
    }, 0);
  });
  let months = newApplicants.map((month, index) => {
    return {
      id: newApplicants[index],
      newApplicants: month,
      totalApplicants: totalApplicants[index],
      activeFees: activeFees[index],
      idleFees:
        idleArray[index] == null
          ? 0
          : (idleArray[index] * ApplicantPrices.idle) / 100,
    };
  });

  useEffect(() => {
    newApplicants = Array.from({ length: 12 }, () => getRandom());
  }, [lowEnd, highEnd]);
  return (
    <div className="mt-14 px-8 lg:px-4  rounded-md grid lg:grid-cols-2 grid-cols-1 w-full justify-items-center   max-w-7xl mx-auto ">
      <div className=" col-span-1  my-2 justify-start w-full space-y-5">
        <h1 className=" text-4xl font-bold text-dark  block w-full">
          Pricing Estimate
        </h1>

        <div className=" w-full flex-wrap block">
          <h4 className=" text-xl text-dark block w-full">
            How many applicants do you process each month?
          </h4>
        </div>

        <div className="w-1/3 relative border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-blue-gray-600 focus-within:border-blue-gray-600">
          <label
            htmlFor="name"
            className="absolute -top-3 left-2 -mt-px inline-block px-1 bg-white text-md font-medium text-dark"
          >
            Low end:
          </label>

          <NumberFormat
            allowNegative={false}
            className="block w-full border-0 p-0 py-2 text-dark placeholder-gray-500 focus:ring-0 sm:text-lg"
            value={lowEnd}
            placeholder={lowEnd}
            decimalScale={0}
            thousandSeparator={true}
            fixedDecimalScale
            displayType={"input"}
            onChange={(e) => setLowEnd(e.target.value.split(",").join(""))}
          />
        </div>
        <div className="w-1/3 relative border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-blue-gray-600 focus-within:border-blue-gray-600">
          <label
            htmlFor="name"
            className="absolute -top-3 left-2 -mt-px inline-block px-1 bg-white text-md font-medium text-dark"
          >
            High end:
          </label>

          <NumberFormat
            allowNegative={false}
            className="block w-full border-0 p-0 py-2 text-dark placeholder-gray-500 focus:ring-0 sm:text-lg"
            value={highEnd}
            placeholder={highEnd}
            decimalScale={0}
            thousandSeparator={true}
            fixedDecimalScale
            displayType={"input"}
            onChange={(e) => setHighEnd(e.target.value.split(",").join(""))}
          />
        </div>

        <h5 className="text-blue-gray-400  text-lg">
          Assumes your applicants complete their application within one month
          and you keep all previous applications for your records.
        </h5>
      </div>

      <div className=" border rounded-lg  col-span-1 w-full">
        <div className="grid grid-cols-3 rounded-lg">
          <div className="col-span-1 rounded-lg">
            <h1 className=" text-center py-4 text-sm lg:text-lg font-bold text-dark   bg-blue-gray-100 border-b  border-blue-gray-400 rounded-tl-lg">
              New Applicants
            </h1>
            {months.map((month, index) => (
              <div
                key={index}
                className={index % 2 === 0 ? "bg-white " : "bg-blue-gray-50 "}
              >
                <div className="   text-center  lg:px-6  whitespace-nowrap text-sm  text-blue-gray-500">
                  <NumberFormat
                    className=" mx-auto flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-light focus:border-light text-lg border-gray-300"
                    value={month.newApplicants}
                    thousandSeparator={true}
                    displayType={"text"}
                    allowNegative={false}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="col-span-1">
            <h1 className=" text-center py-4 text-sm lg:text-lg font-bold text-dark   bg-blue-gray-100 border-b border-l border-blue-gray-400">
              Total Applicants
            </h1>
            {months.map((month, index) => (
              <div
                key={index}
                className={index % 2 === 0 ? "bg-white " : "bg-blue-gray-50 "}
              >
                <div className="   text-center  lg:px-6  whitespace-nowrap text-sm  text-blue-gray-500">
                  <NumberFormat
                    className=" mx-auto flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-light focus:border-light text-lg border-gray-300"
                    value={month.totalApplicants}
                    thousandSeparator={true}
                    displayType={"text"}
                    allowNegative={false}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="col-span-1">
            <h1 className="text-center py-4 text-sm lg:text-lg font-bold text-dark   bg-blue-gray-100 border-b border-l border-blue-gray-400 rounded-tr-lg">
              Estimated Price
            </h1>
            {months.map((month, index) => (
              <div
                key={index}
                className={index % 2 === 0 ? "bg-white " : "bg-blue-gray-50 "}
              >
                <div className="   text-center  lg:px-6  whitespace-nowrap text-sm  text-blue-gray-500">
                  <NumberFormat
                    allowNegative={false}
                    className=" text-dark font-semibold mx-auto flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-light focus:border-light text-lg border-gray-300"
                    value={month.idleFees + month.activeFees}
                    decimalScale={2}
                    thousandSeparator={true}
                    fixedDecimalScale
                    prefix={"$"}
                    displayType={"text"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
