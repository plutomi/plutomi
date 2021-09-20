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
        <h1 className=" text-4xl font-bold text-normal  block w-full">
          Pricing Estimate
        </h1>

        <div className=" w-full flex-wrap block">
          <h4 className=" text-xl text-normal block w-full">
            How many applicants do you process each month?
          </h4>
        </div>
        <div className="  w-full ">
          <div className=" flex rounded-md space-x-2 max-w-lg  ">
            <div className="flex ">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-blue-gray-300 bg-blue-gray-900 text-blue-gray-100 text-lg">
                Low end:
              </span>
              <NumberFormat
                allowNegative={false}
                className="max-w-xs mx-auto flex-1 min-w-0 block w-full px-3 py-4 rounded-none rounded-r-md focus:ring-idle-dark focus:border-idle-dark text-xl border-gray-300"
                value={lowEnd}
                placeholder={lowEnd}
                decimalScale={0}
                thousandSeparator={true}
                fixedDecimalScale
                displayType={"input"}
                onChange={(e) => setLowEnd(e.target.value.split(",").join(""))}
              />
            </div>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-blue-gray-300 bg-blue-gray-900 text-blue-gray-100 text-lg">
                High end:
              </span>

              <NumberFormat
                className="max-w-xs mx-auto flex-1 min-w-0 block w-full px-4 py-4 rounded-none rounded-r-md focus:ring-idle-dark focus:border-idle-dark text-xl border-gray-300"
                value={highEnd}
                placeholder={highEnd}
                decimalScale={0}
                allowNegative={false}
                thousandSeparator={true}
                fixedDecimalScale
                displayType={"input"}
                onChange={(e) => setHighEnd(e.target.value.split(",").join(""))}
              />
            </div>
          </div>
        </div>
        <h5 className="text-blue-gray-400  text-lg">
          Assumes your applicants complete their application within one month
          and you keep all previous applications for your records.
        </h5>
        {/* 
        <div className="my-4 p-4 bg-blue-gray-50 rounded-md border border-blue-gray-900">
          <h5 className="text-normal  text-lg">
            We offer discounted prices for students and non profits! Please
            contact us :)
          </h5>
        </div> */}
      </div>

      {/* Table start */}
      <div className="col-span-1 w-full">
        <div className=" flex lg:justify-end justify-center ">
          <div className="my-2 align-middle inline-block max-w-xl  w-full">
            <div className="shadow border rounded-xl  overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className=" divide-y divide-gray-200 text-center w-full">
                <thead className="bg-blue-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3  py-3 text-center text-xl  text-blue-gray-500 font-bold uppercase tracking-wider"
                    >
                      New Applicants
                    </th>

                    <th
                      scope="col"
                      className="px-3  py-3 text-center text-xl  text-blue-gray-500 font-bold uppercase tracking-wider"
                    >
                      Total Applicants
                    </th>
                    {/* <th
                      scope="col"
                      className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Active Fees
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Idle Fees
                    </th> */}
                    <th
                      scope="col"
                      className="px-3  py-3 text-center text-xl  text-blue-gray-500 font-bold uppercase tracking-wider"
                    >
                      Monthly Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((month, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-blue-gray-50"
                      }
                    >
                      <td className=" text-center  px-6  whitespace-nowrap text-sm  text-blue-gray-500">
                        <NumberFormat
                          className=" mx-auto flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-idle-dark focus:border-idle-dark text-lg border-gray-300"
                          value={month.newApplicants}
                          thousandSeparator={true}
                          displayType={"text"}
                          allowNegative={false}
                        />
                      </td>
                      <td className=" text-center  px-6  whitespace-nowrap text-sm  text-blue-gray-500">
                        <NumberFormat
                          className=" mx-auto flex-1 min-w-0 block w-full px-3 py-2  rounded-none rounded-r-md focus:ring-idle-dark focus:border-idle-dark text-lg border-gray-300"
                          value={month.totalApplicants}
                          thousandSeparator={true}
                          allowNegative={false}
                          displayType={"text"}
                        />
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {}

                        <NumberFormat
                          className=" mx-auto flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-idle-dark focus:border-idle-dark sm:text-sm border-gray-300"
                          value={month.activeFees}
                          decimalScale={2}
                          thousandSeparator={true}
                          fixedDecimalScale
                          prefix={"$"}
                          displayType={"text"}
                        />
                      </td> */}
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <NumberFormat
                          className=" mx-auto flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-idle-dark focus:border-idle-dark sm:text-sm border-gray-300"
                          value={month.idleFees}
                          decimalScale={2}
                          thousandSeparator={true}
                          fixedDecimalScale
                          prefix={"$"}
                          displayType={"text"}
                        />
                      </td> */}
                      <td className=" text-center  px-6  whitespace-nowrap text-sm  text-blue-gray-500">
                        <NumberFormat
                          allowNegative={false}
                          className=" text-normal font-semibold mx-auto flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-idle-dark focus:border-idle-dark text-lg border-gray-300"
                          value={month.idleFees + month.activeFees}
                          decimalScale={2}
                          thousandSeparator={true}
                          fixedDecimalScale
                          prefix={"$"}
                          displayType={"text"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
