export default function LoginEmail({
  user_email,
  onChange,
  sendEmail,
  button_text,
}) {
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
        className="block w-full py-3 text-base rounded-md placeholder-normal shadow-sm focus:ring-normal focus:border-normal sm:flex-1 border-blue-gray-300"
        placeholder="Sign in with your email"
      />
      <button
        type="submit"
        className="mt-3 w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-gray-600 shadow-sm transition duration-200 ease-in-out hover:bg-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-normal sm:mt-0 sm:ml-3 sm:flex-shrink-0 sm:inline-flex sm:items-center sm:w-auto"
      >
        {button_text}
      </button>
    </form>
  );
}
