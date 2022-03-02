import { ChevronRightIcon } from "@heroicons/react/outline";

const webhooks = [
  {
    id: 1,
    name: "New Applicant Email",
    description: "Sends an email to the applicant to thank them for applying",
    url: "https://yourcompany.com/webhooks/plutomi",
  },
  {
    id: 2,
    name: "New Applicant Notification",
    description: "Sends a message to the #recruiting channel",
    url: "https://slack.com/your-company/channel/example",
  },
];

export default function Example() {
  return (
    <div className="w-full mt-2">
      <div className="bg-white shadow overflow-hidden sm:rounded-md w-full">
        <ul role="list" className="divide-y divide-gray-200">
          {webhooks.map((webhook) => (
            <li key={webhook.id}>
              <a
                href="#"
                className=" hover:bg-gray-50 flex justify-between items-center"
              >
                <div className="px-4 py-4 sm:px-6 w-1/2">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-dark truncate">
                      {webhook.name}
                    </p>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {webhook.url}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 w-1/2 text-left py-4 sm:px-6  right-0">
                  <p className="text-sm  text-light">{webhook.description}</p>
                </div>
                <div>
                  <ChevronRightIcon
                    className="h-6 w-6 text-gray-400 ml-2"
                    aria-hidden="true"
                  />
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
