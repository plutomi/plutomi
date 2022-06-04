import { useState } from 'react';
import { CheckIcon, ClipboardCopyIcon } from '@heroicons/react/outline';

interface ClickToCopyProps {
  showText: string;
  copyText: string;
}
export const ClickToCopy = ({ showText, copyText }: ClickToCopyProps) => {
  const [copied, setCopied] = useState(false);

  // TODO types
  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation(); // just incase its inside another div
    navigator.clipboard.writeText(copyText);
    setCopied(true);
  };

  return (
    <div className="ml-3 inline-flex items-center ">
      {copied ? (
        <p className="  text-light inline-flex space-x-3  items-center px-2 ">
          Copied{' '}
          <span className="text-emerald-500 ">
            <CheckIcon className="h-5 w-5 " />
          </span>
        </p>
      ) : (
        <button
          type="button"
          className="underline inline-flex items-center rounded-full text-blue-500 hover:text-blue-800 transition ease-in duration-200 hover:bg-blue-100 px-2"
          onClick={(e) => handleCopy(e)}
        >
          <span className=""> {showText}</span>
          <ClipboardCopyIcon className="h-5 w-5 ml-2" />
        </button>
      )}
    </div>
  );
};
