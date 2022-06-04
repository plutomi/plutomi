import { FormEvent, Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { mutate } from 'swr';
import useStore from '../../utils/store';
import { CreateOrg } from '../../adapters/Orgs';
import { GetSelfInfoURL } from '../../adapters/Users';
import TagGenerator from '../../utils/tagGenerator';

export const CreateOrgModal = () => {
  const [displayName, setDisplayName] = useState('');
  const [orgId, setOrgId] = useState('');

  const closeCreateOrgModal = useStore((state) => state.closeCreateOrgModal);
  const visibility = useStore((state) => state.showCreateOrgModal);

  const handleCreateOrg = async (e: FormEvent) => {
    e.preventDefault();
    console.log({
      orgId,
      displayName,
    });
    if (
      !confirm(
        `Your org id will be '${TagGenerator({
          value: orgId,
        })}', this CANNOT be changed. Do you want to continue?`,
      )
    ) {
      return;
    }

    try {
      const { data } = await CreateOrg({
        displayName,
        orgId,
      });
      alert(data.message);
      setDisplayName('');
      setOrgId('');
      closeCreateOrgModal();
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(GetSelfInfoURL());
  };
  return (
    <Transition.Root show={visibility || false} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden " onClose={closeCreateOrgModal}>
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
                  onSubmit={handleCreateOrg}
                >
                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="py-6 px-4 bg-blue-700 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-medium text-white">
                          New Organization
                        </Dialog.Title>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            type="button"
                            className="bg-blue-700 rounded-md text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={closeCreateOrgModal}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-blue-300">
                          Get started by creating an organization which will contain your openings
                          and users
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="px-4 divide-y divide-gray-200 sm:px-6">
                        <div className="space-y-6 pt-6 pb-5">
                          <div>
                            <label
                              htmlFor="org-name"
                              className="block text-sm font-medium text-dark"
                            >
                              Organization name
                            </label>
                            <input
                              type="text"
                              name="org-name"
                              id="org-name"
                              required
                              placeholder="Plutomi Inc."
                              onChange={(e) => setDisplayName(e.target.value)}
                              value={displayName}
                              className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label htmlFor="org-id" className="block text-sm font-medium text-dark">
                              Custom ID
                            </label>
                            <input
                              type="text"
                              name="org-id"
                              id="org-id"
                              required
                              maxLength={30}
                              onChange={(e) => setOrgId(TagGenerator({ value: e.target.value }))}
                              value={orgId}
                              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                              placeholder="Use only a-z, 0-9, and dash '-'"
                            />

                            {orgId && (
                              <p className="mt-2 text-blue-gray-500 text-md">
                                Your ID will be:{' '}
                                <span className="font-bold text-dark">{orgId}</span>
                              </p>
                            )}
                            <p className="text-red-400 mt-2 text-md">
                              Your ID <span className="font-bold">cannot</span> be changed, please
                              choose carefully.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 px-4 py-4 flex justify-end">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={closeCreateOrgModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Org
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
