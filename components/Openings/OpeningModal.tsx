import { FormEvent, Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import useOpeningById from "../../SWR/useOpeningById";
import { XIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";

interface OpeningModalInput {
  createOpening?: Function;
  updateOpening?: Function;
}

// Todo rename this to opening modal
export default function OpeningModal({
  createOpening,
  updateOpening,
}: OpeningModalInput) {
  const openingModal = useStore((state) => state.openingModal);
  const setOpeningModal = useStore((state) => state.setOpeningModal);

  const { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    openingModal.opening_id
  );
  const handleSubmit = async (e: FormEvent) => {
    if (openingModal.modal_mode === "CREATE") {
      e.preventDefault();
      await createOpening();
    }

    if (openingModal.modal_mode === "EDIT") {
      e.preventDefault();
      await updateOpening();
    }
  };

  return (
    <Transition.Root show={openingModal.is_modal_open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden "
        onClose={() =>
          setOpeningModal({ ...openingModal, is_modal_open: false })
        }
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-y-0 pl-16 max-w-full right-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen max-w-md">
                <form
                  className="h-full divide-y divide-gray-200 flex flex-col bg-white shadow-xl"
                  onSubmit={(e) => handleSubmit(e)}
                >
                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="py-6 px-4 bg-blue-700 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-medium text-white">
                          {openingModal.modal_mode === "CREATE"
                            ? "New Opening"
                            : "Edit Opening"}
                        </Dialog.Title>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            type="button"
                            className="bg-blue-700 rounded-md text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={() =>
                              setOpeningModal({
                                ...openingModal,
                                is_modal_open: false,
                              })
                            }
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-blue-300">
                          An opening is what you need applicants for. It could
                          be a job like &apos;Engineer&apos;, a location like
                          &apos;New York&apos; or &apos;Miami&apos;, or just the
                          name of your program.
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="px-4 divide-y divide-gray-200 sm:px-6">
                        <div className="space-y-6 pt-6 pb-5">
                          <div>
                            <label
                              htmlFor="opening-name"
                              className="block text-sm font-medium text-dark"
                            >
                              {openingModal.modal_mode === "CREATE"
                                ? "Opening name"
                                : "Edit name"}
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="opening-name"
                                id="opening-name"
                                required
                                onChange={(e) =>
                                  setOpeningModal({
                                    ...openingModal,
                                    GSI1SK: e.target.value,
                                  })
                                }
                                value={openingModal.GSI1SK}
                                className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          <div className="relative flex items-start">
                            {openingModal.modal_mode === "CREATE" ||
                            opening.total_stages == 0 ? (
                              <p className="text-light text-sm ">
                                You will be able to make this opening public
                                after adding a stage.
                              </p>
                            ) : (
                              <div>
                                {" "}
                                <div className="flex items-center h-5">
                                  <input
                                    id="comments"
                                    aria-describedby="comments-description"
                                    name="comments"
                                    type="checkbox"
                                    checked={openingModal.is_public}
                                    onChange={(e) =>
                                      setOpeningModal({
                                        ...openingModal,
                                        is_public: e.target.checked,
                                      })
                                    }
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                  />
                                  <div className="ml-3 text-sm">
                                    <label
                                      htmlFor="comments"
                                      className="font-medium text-gray-700"
                                    >
                                      Public
                                    </label>
                                    <p
                                      id="comments-description"
                                      className="text-normal"
                                    >
                                      Make this opening available to everyone
                                    </p>
                                  </div>{" "}
                                </div>{" "}
                              </div>
                            )}
                          </div>

                          {/* <div>
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-dark"
                            >
                              Description
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="description"
                                name="description"
                                rows={4}
                                className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300 rounded-md"
                                defaultValue={""}
                              />
                            </div>
                          </div> */}
                          {/* <div>
                           <h3 className="text-sm font-medium text-dark">
                              Team Members
                            </h3> */}
                          {/* <div className="mt-2">
                              <div className="flex space-x-2">
                                {team.map((person) => (
                                  <a
                                    key={person.email}
                                    href={person.href}
                                    className="rounded-full hover:opacity-75"
                                  >
                                    <img
                                      className="inline-block h-8 w-8 rounded-full"
                                      src={person.imageUrl}
                                      alt={person.name}
                                    />
                                  </a>
                                ))}
                                <button
                                  type="button"
                                  className="flex-shrink-0 bg-white inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-200 text-light hover:text-normal hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <span className="sr-only">
                                    Add team member
                                  </span>
                                  <PlusSmIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </div>
                          </div> */}
                          {/* <fieldset>
                            <legend className="text-sm font-medium text-dark">
                              Privacy
                            </legend>
                            <div className="mt-2 space-y-5">
                              <div className="relative flex items-start">
                                <div className="absolute flex items-center h-5">
                                  <input
                                    id="privacy-public"
                                    name="privacy"
                                    aria-describedby="privacy-public-description"
                                    type="radio"
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                    defaultChecked
                                  />
                                </div>
                                <div className="pl-7 text-sm">
                                  <label
                                    htmlFor="privacy-public"
                                    className="font-medium text-dark"
                                  >
                                    Public access
                                  </label>
                                  <p
                                    id="privacy-public-description"
                                    className="text-normal"
                                  >
                                    Everyone with the link will see this
                                    project.
                                  </p>
                                </div>
                              </div>
                              <div>
                                <div className="relative flex items-start">
                                  <div className="absolute flex items-center h-5">
                                    <input
                                      id="privacy-private-to-project"
                                      name="privacy"
                                      aria-describedby="privacy-private-to-project-description"
                                      type="radio"
                                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                  </div>
                                  <div className="pl-7 text-sm">
                                    <label
                                      htmlFor="privacy-private-to-project"
                                      className="font-medium text-dark"
                                    >
                                      Private to project members
                                    </label>
                                    <p
                                      id="privacy-private-to-project-description"
                                      className="text-normal"
                                    >
                                      Only members of this project would be able
                                      to access.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="relative flex items-start">
                                  <div className="absolute flex items-center h-5">
                                    <input
                                      id="privacy-private"
                                      name="privacy"
                                      aria-describedby="privacy-private-to-project-description"
                                      type="radio"
                                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                  </div>
                                  <div className="pl-7 text-sm">
                                    <label
                                      htmlFor="privacy-private"
                                      className="font-medium text-dark"
                                    >
                                      Private to you
                                    </label>
                                    <p
                                      id="privacy-private-description"
                                      className="text-normal"
                                    >
                                      You are the only one able to access this
                                      project.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </fieldset> 
                          </div>*/}
                          {/* <div className="pt-4 pb-6">
                          <div className="flex text-sm">
                            <a
                              href="#"
                              className="group inline-flex items-center font-medium text-blue-600 hover:text-blue-900"
                            >
                              <LinkIcon
                                className="h-5 w-5 text-blue-500 group-hover:text-blue-900"
                                aria-hidden="true"
                              />
                              <span className="ml-2">Copy link</span>
                            </a>
                          </div>
                          <div className="mt-4 flex text-sm">
                            <a
                              href="#"
                              className="group inline-flex items-center text-normal hover:text-dark"
                            >
                              <QuestionMarkCircleIcon
                                className="h-5 w-5 text-light group-hover:text-normal"
                                aria-hidden="true"
                              />
                              <span className="ml-2">
                                Learn more about sharing
                              </span>
                            </a>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 px-4 py-4 flex justify-end">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() =>
                        setOpeningModal({
                          ...openingModal,
                          is_modal_open: false,
                        })
                      }
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {openingModal.modal_mode === "CREATE"
                        ? "Create"
                        : "Update"}{" "}
                      opening
                    </button>
                  </div>
                </form>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
