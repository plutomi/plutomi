import { FormEvent, Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import useStore from '../../utils/store';
import { GetOpeningInfoURL } from '../../adapters/Openings';
import { GetStagesInOpeningURL, UpdateStage } from '../../adapters/Stages';
import { CustomQuery } from '../../types/main';
import { DynamoStage } from '../../types/dynamo';

interface UpdateStageModalProps {
  stage: DynamoStage;
}

export const UpdateStageModal = ({ stage }: UpdateStageModalProps) => {
  const router = useRouter();

  const { openingId, stageId } = router.query as Pick<CustomQuery, 'openingId' | 'stageId'>;
  const [GSI1SK, setGSI1SK] = useState('');

  useEffect(() => {
    setGSI1SK(stage?.GSI1SK);
  }, [stage?.GSI1SK]);

  const visibility = useStore((state) => state.showUpdateStageModal);
  const closeUpdateStageModal = useStore((state) => state.closeUpdateStageModal);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await UpdateStage({
        openingId,
        stageId,
        newValues: {
          GSI1SK,
        },
      });
      alert(data.message);
      setGSI1SK('');
      closeUpdateStageModal();
    } catch (error) {
      alert(error.response.data.message);
    }
    // Refresh stage order
    mutate(GetOpeningInfoURL(openingId));

    // Refresh stage list
    mutate(GetStagesInOpeningURL(openingId));
    // TODO
  };

  return (
    <Transition.Root show={visibility} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden " onClose={closeUpdateStageModal}>
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
                          Update Stage
                        </Dialog.Title>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            type="button"
                            className="bg-blue-700 rounded-md text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={closeUpdateStageModal}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-blue-300">
                          Stages are individual steps in your application process such as
                          &apos;Questionnaire&apos;, &apos;Under Review&apos;, or &apos;Ready to
                          Drive&apos;.
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
                              New Stage Name
                            </label>
                            <input
                              type="text"
                              name="opening-name"
                              id="opening-name"
                              placeholder="What is the overall purpose of this stage?"
                              required
                              onChange={(e) => setGSI1SK(e.target.value)}
                              value={GSI1SK}
                              className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 px-4 py-4 flex justify-end">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={closeUpdateStageModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Update Stage
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
