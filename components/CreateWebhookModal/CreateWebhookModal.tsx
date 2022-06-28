import { FormEvent, Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { mutate } from 'swr';
import { XIcon } from '@heroicons/react/outline';
import { CreateWebhook, GetWebhooksInOrgURL } from '../../adapters/Webhooks';
import useStore from '../../utils/store';
import { LIMITS } from '../../Config';
import { CustomLink } from '../CustomLink';

export const CreateWebhookModal = () => {
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [description, setDescription] = useState('');
  const visibility = useStore((state) => state.showCreateWebhookModal);

  const closeCreateWebhookModal = useStore((state) => state.closeCreateWebhookModal);

  const clearModal = () => {
    setWebhookName('');
    setDescription('');
    setWebhookUrl('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await CreateWebhook({
        webhookUrl,
        webhookName,
        description,
      });
      alert(data.message);
      clearModal();
      closeCreateWebhookModal();
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the actual webhook list
    mutate(GetWebhooksInOrgURL());
  };

  return (
    <Transition.Root show={visibility} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden " onClose={closeCreateWebhookModal}>
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
                          New Webhook
                        </Dialog.Title>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            type="button"
                            className="bg-blue-700 rounded-md text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={closeCreateWebhookModal}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-blue-300">
                          We can send <strong>all</strong> applicant events to webhooks that you
                          choose. You can then setup third party integrations like Zendesk, Slack,
                          Zapier, or even your own server for further processing.
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="px-4 divide-y divide-gray-200 sm:px-6">
                        <div className="space-y-6 pt-6 pb-5">
                          <div>
                            <label
                              htmlFor="webhook-name"
                              className="block text-sm font-medium text-dark"
                            >
                              Webhook name
                            </label>
                            <input
                              type="text"
                              name="webhook-name"
                              placeholder="New Applicant Notifications"
                              id="webhook-name"
                              required
                              onChange={(e) => setWebhookName(e.target.value)}
                              value={webhookName}
                              className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="webhook-description"
                              className="block text-sm font-medium text-dark"
                            >
                              Description (optional)
                            </label>
                            <textarea
                              name="webhook-description"
                              id="webhook-description"
                              placeholder="Sends a slack message to the #recruiting channel"
                              onChange={(e) => setDescription(e.target.value)}
                              value={description}
                              maxLength={LIMITS.MAX_WEBHOOK_DESCRIPTION_LENGTH}
                              className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="webhook-url"
                              className="block text-sm font-medium text-dark"
                            >
                              URL
                            </label>
                            <input
                              type="url"
                              name="webhook-url"
                              id="webhook-url"
                              placeholder="https://domain.com/webhooks"
                              required
                              onChange={(e) => setWebhookUrl(e.target.value)}
                              value={webhookUrl}
                              className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                            />
                          </div>
                          <div className="relative flex items-start">
                            <p className="text-light text-sm ">
                              A <code>POST</code> event with the applicant&apos;s information will
                              be sent. You can see what info is in the event by viewing the{' '}
                              <span className="text-white">
                                <CustomLink
                                  text="DynamoApplicant"
                                  url="https://github.com/plutomi/plutomi/blob/main/types/dynamo.d.ts#L107"
                                />
                              </span>{' '}
                              entity.
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
                      onClick={closeCreateWebhookModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create webhook
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
