export type CommitType = {
  url: string;
  username: string;
  name: string;
  image: string;
  date: string;
  email: string;
  message: string;
};
export const Commit: React.FC<CommitType> = ({
  url,
  username,
  name,
  message,
  image,
  date
}) => {
  return (
    <div
      className="p-2 bg-white  w-full max-w-3xl rounded-[0.75rem] shadow hover:shadow-md transition ease-in-out duration-100  cursor-pointer"
      onClick={() => window.open(url, "_blank", "noopener noreferrer")}
    >
      <div className="flex items-center">
        <div className="shrink-0">
          <img
            className="inline-block h-16 w-16 md:h-24 md:w-24 rounded-[0.25rem]"
            src={image}
            alt={`@${username} GitHub avatar`}
          />
        </div>
        <div className="px-3 max-w-2xl">
          <p className="text-slate-500 text-sm">
            {String(new Date(date).toLocaleDateString())}
          </p>
          <p className="text-lg font-semibold text-slate-700 ">
            {name} -{" "}
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition ease-in-out duration-200 text-blue-500 hover:text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              @{username}
            </a>
          </p>
          <p className="text-slate-500 line-clamp-2">{message}</p>
        </div>
      </div>
    </div>
  );
};
