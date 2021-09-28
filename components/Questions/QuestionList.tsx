export default function QuestionList({ questions }) {
  return (
    <div>
      <div className="flow-root mt-6">
        <ul role="list" className="-my-5 divide-y divide-gray-200">
          {questions.map((question: DynamoStageQuestion) => (
            <li key={question.question_id} className="py-5">
              <div className="relative focus-within:ring-2 focus-within:ring-blue-500">
                <h3 className="text-sm font-semibold text-gray-800">
                  {/* <a href="#" className="hover:underline focus:outline-none"> */}
                  {/* Extend touch target to entire panel */}
                  <span className="absolute inset-0" aria-hidden="true" />
                  {question.GSI1SK}
                  {/* </a> */}
                </h3>
                {question.question_description ? (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {question.question_description}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* <div className="mt-6">
        <a
          href="#"
          className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          View all
        </a>
      </div> */}
    </div>
  );
}
