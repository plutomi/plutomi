import { ArrowLeftIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
export default function GoBack() {
  const router = useRouter();
  return (
    <div className="text-md my-2 xl:mx-24 mx-4  text-light hover:text-blue-gray-900 ">
      <button
        onClick={() => router.back()}
        type="button"
        className="inline-flex items-center py-2  transition duration-300 ease-in-out font-medium rounded-md "
      >
        <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        Go Back
      </button>
    </div>
  );
}
