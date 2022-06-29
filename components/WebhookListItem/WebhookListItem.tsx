import { useState } from 'react';
import { PencilAltIcon, TrashIcon } from '@heroicons/react/outline';
import { mutate } from 'swr';
import { DeleteWebhookFromOrg, GetWebhooksInOrgURL } from '../../adapters/Webhooks';
import useStore from '../../utils/store';
import { DynamoWebhook } from '../../types/dynamo';
import { UpdateWebhookModal } from '../UpdateWebhookModal';

interface WebhookListItemProps {
  webhook: DynamoWebhook;
}

export const WebhookListItem = ({ webhook }: WebhookListItemProps) => {
  const setCurrentWebhook = useStore((state) => state.setCurrentWebhook);

  const openUpdateWebhookModal = useStore((state) => state.openUpdateWebhookModal);

  const handleEdit = () => {
    setCurrentWebhook(webhook);
    openUpdateWebhookModal();
  };

  const handleDelete = async (webhook: DynamoWebhook) => {
    const deleteMessage = `Are you sure you want to delete this webhook?`;

    if (!confirm(deleteMessage)) {
      return;
    }

    try {
      const data = await DeleteWebhookFromOrg(webhook.webhookId);
      alert(data.data.message);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the webhooks
    mutate(GetWebhooksInOrgURL());
  };

  // Essentially fill in all the details of the modal and then open it
  return (
    <li className="border rounded-lg shadow-sm px-4 py-2max-w-lg mx-auto my-2 bg-white hover:bg-sky-50 transition ease-in-out duration-300 flex justify-between">
      <div className=" py-2  h-full relative focus-within:ring-2 focus-within:ring-blue-500">
        <h3 className="text-lg font-semibold text-dark">
          <span className="absolute inset-0" aria-hidden="true" />
          {webhook?.webhookName}
        </h3>
        <p className="text-md text-light line-clamp-2 mt-1">{webhook?.webhookUrl}</p>

        <p className="text-md text-light line-clamp-2 mt-1">{webhook?.description}</p>
      </div>
      <div className="flex justify-center items-center ">
        <button
          type="button"
          onClick={handleEdit}
          className="rounded-full hover:bg-white text-blue-500 transition ease-in-out duration-200 px-3 py-3 text-md"
        >
          <PencilAltIcon className="w-6 h-6" />
        </button>
        <button
          type="submit"
          onClick={() => handleDelete(webhook)}
          className="rounded-full hover:bg-white text-red-500 transition ease-in-out duration-200 px-3 py-3 text-md"
        >
          <TrashIcon className="w-6 h-6" />
        </button>
      </div>
    </li>
  );
};
