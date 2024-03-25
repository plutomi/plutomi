export default function CommitLoading() {
  return (
    <div className="py-1 px-2 w-full bg-white  max-w-3xl rounded-md shadow-md hover:shadow-lg transition ease-in-out duration-150 hover:scale-102 cursor-pointer">
      <div className="animate-pulse flex ">
        <div className="shrink-0  flex items-center">
          <div className="rounded-lg bg-slate-200 h-24 w-24"></div>
        </div>
        <div className=" w-full h-full space-y-2 py-2 ">
          <div className="px-3 max-w-2xl grid grid-cols-6">
            <div
              id="date"
              className="h-3 bg-slate-200 rounded col-span-1"
            ></div>
          </div>
          <div className="px-3 max-w-2xl grid grid-cols-12 space-x-2">
            <div
              id="name"
              className="h-4 bg-slate-400 rounded col-span-2"
            ></div>
            <div
              id="username"
              className="h-4 bg-blue-400 rounded col-span-3"
            ></div>
          </div>
          <div className="px-3 max-w-2xl grid grid-cols-12  space-y-2">
            <div
              id="description"
              className="h-4 bg-slate-300 rounded col-span-12"
            ></div>
            <div
              id="description2"
              className="h-4 bg-slate-300 rounded col-span-5"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
