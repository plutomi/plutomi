"use client";

export type CommitType = {
  url: string;
  username: string;
  name: string;
  image: string;
  date: Date;
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
  const handleCardClick = () => {
    window.open(url, "_blank", "noopener noreferrer");
  };

  // className="inline-block h-16 w-16 md:h-24 md:w-24 rounded-lg "

  // TODO add lines changed
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 bg-white w-full max-w-3xl rounded-md shadow-md hover:shadow-lg transition ease-in-out duration-150 hover:scale-102 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-center">
        <div className="shrink-0">
          <img
            className="inline-block h-16 w-16 md:h-24 md:w-24 rounded-lg "
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
            <span
              role="presentation"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://github.com/${username}`,
                  "_blank",
                  "noopener noreferrer"
                );
              }}
              className="transition ease-in-out duration-200 text-blue-500 hover:text-blue-600 hover:underline "
            >
              @{username}
            </span>
          </p>
          <p className="text-slate-500 line-clamp-2">{message}</p>
        </div>
      </div>
    </a>
  );
};
