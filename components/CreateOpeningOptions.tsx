
export default function CreateOpeningOptions() {
  return (
    <fieldset className="space-y-5">
      <legend className="sr-only">Options</legend>
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            id="comments"
            aria-describedby="comments-description"
            name="comments"
            type="checkbox"
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="comments" className="font-medium text-gray-700">
            Public
          </label>
          <p id="comments-description" className="text-gray-500">
            Make this opening available to everyone once created
          </p>
        </div>
      </div>
      {/* <div className="relative flex items-start">
          <div className="flex items-center h-5">
            <input
              id="candidates"
              aria-describedby="candidates-description"
              name="candidates"
              type="checkbox"
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="candidates" className="font-medium text-gray-700">
              Candidates
            </label>
            <p id="candidates-description" className="text-gray-500">
              Get notified when a candidate applies for a job.
            </p>
          </div>
        </div>
        <div className="relative flex items-start">
          <div className="flex items-center h-5">
            <input
              id="offers"
              aria-describedby="offers-description"
              name="offers"
              type="checkbox"
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="offers" className="font-medium text-gray-700">
              Offers
            </label>
            <p id="offers-description" className="text-gray-500">
              Get notified when a candidate accepts or rejects an offer.
            </p>
          </div>
        </div> */}
    </fieldset>
  );
}
