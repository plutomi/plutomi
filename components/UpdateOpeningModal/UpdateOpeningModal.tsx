import { FormEvent, Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { mutate } from 'swr';
import { GetOpeningInfoURL, UpdateOpening } from '../../adapters/Openings';
import useStore from '../../utils/store';
import { OpeningState } from '../../Config';
import { Opening } from '../../entities';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { IndexedEntities } from '../../types/main';

export const UpdateOpeningModal = ({ opening }: { opening: Opening }) => {
  const [openingName, setOpeningName] = useState(opening?.name);
  const openingState = findInTargetArray({
    entity: IndexedEntities.OpeningState,
    targetArray: opening.target,
  });
  const [GSI1SK, setGSI1SK] = useState('');

  useEffect(() => {
    setOpeningName(opening?.name);
    setGSI1SK(openingState);
  }, [opening?.name, openingState]);

  const visibility = useStore((state) => state.showUpdateOpeningModal);

  const closeUpdateOpeningModal = useStore((state) => state.closeUpdateOpeningModal);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const newValues = {
        GSI1SK: openingState === GSI1SK ? undefined : GSI1SK,
        openingName: opening?.name === openingName ? undefined : openingName,
      };

      const { data } = await UpdateOpening({
        openingId: opening.id,
        newValues,
      });
      mutate(GetOpeningInfoURL(opening?.id));
      alert(data.message);
      closeUpdateOpeningModal();
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <Transition.Root show={visibility} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden " onClose={closeUpdateOpeningModal}>
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
                          Editing {openingName}
                        </Dialog.Title>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            type="button"
                            className="bg-blue-700 rounded-md text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={closeUpdateOpeningModal}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-blue-300">
                          An opening is what you need applicants for. It could be a job like
                          &apos;Engineer&apos;, a location like &apos;New York&apos; or
                          &apos;Miami&apos;, or just the name of your program.
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
                              Edit name
                            </label>
                            <input
                              type="text"
                              name="opening-name"
                              id="opening-name"
                              required
                              onChange={(e) => setOpeningName(e.target.value)}
                              value={openingName}
                              className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                            />
                          </div>
                          <div className="relative flex items-start">
                            {opening?.totalStages === 0 ? (
                              <p className="text-light text-sm ">
                                You will be able to make this opening public after adding a stage.
                              </p>
                            ) : (
                              <div>
                                {' '}
                                <div className="flex items-center h-5">
                                  <input
                                    id="comments"
                                    aria-describedby="comments-description"
                                    name="comments"
                                    type="checkbox"
                                    // TODO types
                                    checked={GSI1SK === OpeningState.PUBLIC}
                                    onChange={(e) =>
                                      setGSI1SK(
                                        e.target.checked
                                          ? OpeningState.PUBLIC
                                          : OpeningState.PRIVATE,
                                      )
                                    }
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                  />
                                  <div className="ml-3 text-sm">
                                    <p className="font-medium text-gray-700">Public</p>
                                    <p id="comments-description" className="text-normal">
                                      Make this opening available for everyone to apply
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 px-4 py-4 flex justify-end">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={closeUpdateOpeningModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Update opening
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
};
