import { FormEvent, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";

const descriptionMaxLength = 300;
export default function QuestionModal({ createQuestion, updateQuestion }) {
  const questionModal = useStore((state) => state.questionModal);

  const setQuestionModal = useStore((state) => state.setQuestionModal);

  const handleSubmit = async (e: FormEvent) => {
    if (questionModal.modalMode === "CREATE") {
      e.preventDefault();
      await createQuestion();
    }

    if (questionModal.modalMode === "EDIT") {
      e.preventDefault();
      await updateQuestion();
    }
  };

  return (
    <Transition.Root show={questionModal.isModalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden "
        onClose={() =>
          setQuestionModal({ ...questionModal, isModalOpen: false })
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
                          {questionModal.modalMode === "CREATE"
                            ? "New Question"
                            : "Updating Question"}
                        </Dialog.Title>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            type="button"
                            className="bg-blue-700 rounded-md text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={() =>
                              setQuestionModal({
                                ...questionModal,
                                isModalOpen: false,
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
                          Questions will be shown to applicants in this stage
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="px-4 divide-y divide-gray-200 sm:px-6">
                        <div className="space-y-6 pt-6 pb-5">
                          <div>
                            <label
                              htmlFor="title"
                              className="block text-sm font-medium text-dark"
                            >
                              {questionModal.modalMode === "CREATE"
                                ? "Question Title"
                                : "New Title"}
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                placeholder={
                                  "'What is your name?' or 'Tell us about yourself'"
                                }
                                value={questionModal.GSI1SK}
                                onChange={(e) =>
                                  setQuestionModal({
                                    ...questionModal,
                                    GSI1SK: e.target.value,
                                  })
                                }
                                className="block w-full shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-dark"
                            >
                              {questionModal.modalMode === "CREATE"
                                ? "Description"
                                : "New Description"}
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm w-full">
                              <textarea
                                name="description"
                                id="description"
                                placeholder="Optional helper text for your applicants."
                                className="p-2 text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md w-full block resize"
                                maxLength={descriptionMaxLength} // TODO add counter
                                rows={5}
                                value={questionModal.questionDescription}
                                onChange={(e) =>
                                  setQuestionModal({
                                    ...questionModal,
                                    questionDescription: e.target.value,
                                  })
                                }
                              ></textarea>
                            </div>
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
                        setQuestionModal({
                          ...questionModal,
                          isModalOpen: false,
                        })
                      }
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {questionModal.modalMode === "CREATE"
                        ? "Create"
                        : "Update"}{" "}
                      Question
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

  {
    /* EDIT ${ENTITY_TYPES.STAGE_QUESTION} */
  }
}
