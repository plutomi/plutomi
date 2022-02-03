export default function LoginEmail({ email, onChange, sendEmail, buttonText }) {
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
        value={email}
        onChange={(e) => onChange(e.target.value)}
        className="block invalid:text-red-500 invalid:border-red-500 
        focus:invalid:border-red-500 focus:invalid:ring-red-500 w-full py-3 text-base rounded-md placeholder-normal shadow-sm focus:ring-green-400 focus:border-green-400 sm:flex-1 border-green-400"
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
}
