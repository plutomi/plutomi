import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function OpeningsDropdown({ openings, index }) {
  const [selected, setSelected] = useState(openings[index]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      {/* <Listbox.Label className="block text-lg font-medium text-gray-700">
        Assigned to
      </Listbox.Label> */}
      <div className="mt-1 relative w-full ">
        <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg">
          <div className="flex items-center">
            <span
              aria-label={selected.is_public ? "Online" : "Offline"}
              className={classNames(
                selected.is_public ? "bg-green-400" : "bg-gray-200",
                "flex-shrink-0 inline-block h-2 w-2 rounded-full"
              )}
            />
            <span className="ml-3 block truncate">{selected.GSI1SK}</span>
          </div>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <SelectorIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-md ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-lg">
            {openings.map((opening: DynamoOpening) => (
              <Listbox.Option
                key={opening.opening_id}
                className={({ active }) =>
                  classNames(
                    active ? "text-white bg-indigo-600" : "text-gray-900",
                    "cursor-default select-none relative py-2 pl-3 pr-9"
                  )
                }
                value={opening}
              >
                {({ selected, active }) => (
                  <>
                    <div className="flex items-center">
                      <span
                        className={classNames(
                          opening.is_public ? "bg-green-400" : "bg-gray-200",
                          "flex-shrink-0 inline-block h-2 w-2 rounded-full"
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={classNames(
                          selected ? "font-semibold" : "font-normal",
                          "ml-3 block truncate"
                        )}
                      >
                        {opening.GSI1SK}
                        <span className="sr-only">
                          {" "}
                          is {opening.is_public ? "online" : "offline"}
                        </span>
                      </span>
                    </div>

                    {selected ? (
                      <span
                        className={classNames(
                          active ? "text-white" : "text-indigo-600",
                          "absolute inset-y-0 right-0 flex items-center pr-4"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
