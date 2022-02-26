import useSelf from "../../SWR/useSelf";
import { DynamoWebhook } from "../../types/dynamo";
import EmptyWebhooksContent from "./EmptyWebhooksContent";
import useWebhooks from "../../SWR/useWebhooks";
import useStore from "../../utils/store";

export default function WebhooksContent() {
  const { user, isUserLoading, isUserError } = useSelf();
  const { webhooks, isWebhooksLoading, isWebhooksError } = useWebhooks(
    user?.orgId
  );

  if (isWebhooksLoading) {
    return <h1>Loading webhooks...</h1>;
  }

  if (isWebhooksError) {
    return (
      <h1 className="text-lg text-red-500">
        An error ocurred retrieving webhooks
      </h1>
    );
  }

  if (webhooks?.length === 0) {
    return <EmptyWebhooksContent />;
  }

  return (
    <>
      <ul role="list" className="divide-y divide-gray-200">
        {webhooks.map((webhook: DynamoWebhook) => (
          <li key={webhook.webhookId} className="py-4">
            <p>{webhook.url}</p>
          </li>
        ))}
      </ul>{" "}
    </>
  );
}
