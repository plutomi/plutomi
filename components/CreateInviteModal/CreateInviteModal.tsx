import { FormEvent, Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import useStore from '../../utils/store';
import { CreateInvite } from '../../adapters/Invites';
import { ORG_INVITE_EXPIRY_DAYS } from '../../Config';

export const CreateInviteModal = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(ORG_INVITE_EXPIRY_DAYS);
  const visibility = useStore((state) => state.showInviteModal);
  const closeInviteModal = useStore((state) => state.closeInviteModal);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      let final = expiresInDays;
      // I case user deletes
      if (isNaN(expiresInDays)) {
        final = ORG_INVITE_EXPIRY_DAYS;
      }

      // TODO add custom expiry - Defaults to 3 days
      const { data } = await CreateInvite({
        recipientEmail,
        expiresInDays: final,
      });
      alert(data.message);
      setRecipientEmail('');
      setExpiresInDays(ORG_INVITE_EXPIRY_DAYS);
      closeInviteModal();
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }
  };
  return (
    <Transition.Root show={visibility} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden " onClose={closeInviteModal}>
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
                          New Team Member
                        </Dialog.Title>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            type="button"
                            className="bg-blue-700 rounded-md text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={closeInviteModal}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-blue-300">
                          You can add unlimited users to your organization.
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="px-4 divide-y divide-gray-200 sm:px-6">
                        <div className="space-y-6 pt-6 pb-5">
                          <div>
                            <label
                              htmlFor="new-user-email"
                              className="block text-sm font-medium text-dark"
                            >
                              What is their email?
                            </label>
                            <input
                              type="email"
                              name="new-user-email"
                              id="new-user-email"
                              required
                              onChange={(e) => setRecipientEmail(e.target.value)}
                              value={recipientEmail}
                              className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                            />
                          </div>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <label
                              htmlFor="price"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Invite will expire in
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <input
                                type="number"
                                name="expiry-days"
                                id="expiry"
                                min={1}
                                max={365}
                                placeholder="3"
                                value={expiresInDays}
                                defaultValue={ORG_INVITE_EXPIRY_DAYS}
                                onChange={(e) => setExpiresInDays(parseInt(e.target.value, 10))}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full  pr-12 sm:text-sm border-gray-300 rounded-md"
                                aria-describedby="invite-days-expiry-currency"
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm" id="price-currency">
                                  days
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 px-4 py-4 flex justify-end">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={closeInviteModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Invite
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
