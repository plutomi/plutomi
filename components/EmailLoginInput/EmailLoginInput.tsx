import { FormEvent } from 'react';

interface LoginEmailprops {
  email: string;
  onChange: (value: string) => void;
  sendEmail: (e: FormEvent<HTMLFormElement>) => void;
  buttonText: string;
}

export const EmailLoginInput = ({ email, onChange, sendEmail, buttonText }: LoginEmailprops) => (
  <form
    className=" sm:flex  w-full max-w-sm md:max-w-md px-4 sm:px-0 "
    onSubmit={(e) => sendEmail(e)}
  >
    <label htmlFor="email" className="sr-only">
      Email
    </label>
    <input
      type="email"
      name="email"
      id="email"
      required
      value={email}
      onChange={(e) => onChange(e.target.value)}
      className="block
        focus:border-blue-500 focus:ring-blue-500 w-full py-3 text-base rounded-md placeholder-normal shadow-sm  sm:flex-1"
      placeholder="Enter your email"
    />

    <button
      type="submit"
      className="mt-3 w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-gray-600 shadow-sm transition duration-200 ease-in-out hover:bg-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-normal sm:mt-0 sm:ml-3 sm:flex-shrink-0 sm:inline-flex sm:items-center sm:w-auto"
    >
      {buttonText}
    </button>
  </form>
);
