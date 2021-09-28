import { PlusIcon } from "@heroicons/react/solid";
import { OfficeBuildingIcon } from "@heroicons/react/outline";
export default function EmptyOrgState() {
  return (
    <div className="text-center border border-red-400 w-full h-full flex flex-col justify-center items-center">
      <OfficeBuildingIcon className="mx-auto h-12 w-12 text-gray-400" />

      <h3 className="mt-2 text-lg font-medium text-gray-900">
        You don&apos;t belong in an org.
      </h3>
      <p className="mt-1 text-lg text-gray-500">
        Get started by creating a new organization.
      </p>
      <div className="mt-6">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Org
        </button>
      </div>
    </div>
  );
}
