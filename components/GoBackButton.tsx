import { ArrowLeftIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
export default function GoBack() {
  const router = useRouter();
  return (
    <div className="ml-8 my-4 p-2 text-normal text-md">
      <button
        onClick={() => router.back()}
        type="button"
        className="inline-flex items-center px-4 py-2 hover:text-light transition duration-300 ease-in-out font-medium rounded-md "
      >
        <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        Go Back
      </button>
    </div>
  );
}
