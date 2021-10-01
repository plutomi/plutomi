import { useState } from "react";
import { CheckIcon, ClipboardCopyIcon } from "@heroicons/react/outline";

export default function ClickToCopy({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <div className="ml-3 inline-flex items-center">
      {copied ? (
        <p className="  text-light inline-flex space-x-3  items-center  ">
          Copied{" "}
          <span className="text-emerald-500 ">
            <CheckIcon className="h-5 w-5 " />
          </span>
        </p>
      ) : (
        <button
          className="inline-flex items-center rounded-full text-blue-500 hover:text-blue-800 transition ease-in duration-200"
          onClick={handleCopy}
        >
          <ClipboardCopyIcon className="h-5 w-5 " />
        </button>
      )}
    </div>
  );
}
