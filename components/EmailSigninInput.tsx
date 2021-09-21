import { FormEvent, useState } from "react";

export default function LoginEmail({ user_email, onChange, sendEmail, button_text }) {
  return (
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
        value={user_email}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full  py-3 text-base rounded-md placeholder-gray-500 shadow-sm focus:ring-blue-gray-500 focus:border-blue-gray-500 sm:flex-1 border-gray-300"
        placeholder="Enter your email"
      />
      <button
        type="submit"
        className="mt-3 w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-gray-500 sm:mt-0 sm:ml-3 sm:flex-shrink-0 sm:inline-flex sm:items-center sm:w-auto"
      >
        {button_text}
      </button>
    </form>
  );
}
