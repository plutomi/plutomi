import { useState } from "react";

export default function LoginCode({ login_code, onChange, signInWithCode }) {
  const [buttonText, setButtonText] = useState("Submit");

  const handleSubmit = (e) => {
    e.preventDefault();
    setButtonText("Logging in..."); // TODO replace with loader
    signInWithCode(e);
  };
  return (
    <form
      className=" sm:flex  w-full max-w-sm md:max-w-md px-4 sm:px-0 "
      onSubmit={(e) => handleSubmit(e)}
    >
      <label htmlFor="email" className="sr-only">
        Email
      </label>
      <input
        type="text"
        name="text"
        id="text"
        required
        value={login_code}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full py-3 text-base rounded-md placeholder-gray-500 shadow-sm focus:ring-blue-gray-500 focus:border-blue-gray-500 sm:flex-1 border-gray-300"
        placeholder="Enter your login code"
      />
      <button
        type="submit"
        onClick={(e) => setButtonText("Logging in...")}
        className="mt-3 w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-gray-500 sm:mt-0 sm:ml-3 sm:flex-shrink-0 sm:inline-flex sm:items-center sm:w-auto"
      >
        {buttonText}
      </button>
    </form>
  );
}
