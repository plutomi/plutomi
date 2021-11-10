import { FormEvent, useState } from "react";
export default function UpdateName({ updateName }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      alert("Please enter a first and last name");
    }

    const body = {
      firstName: firstName,
      lastName: lastName,
    };
    updateName(body);
  };
  return (
    <div className="pt-2 mt-6 shadow  bg-gradient-to-r from-orange-400 to-red-500 rounded-t-xl max-w-7xl ">
      <div className="bg-white">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            We don&apos;t seem to know your name!
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>You can update it below :)</p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-5 sm:flex sm:items-center space-x-4"
          >
            <div className="relative border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600">
              <label
                htmlFor="name"
                className="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-gray-900"
              >
                First Name
              </label>
              <input
                type="text"
                name="first-name"
                id="first-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                placeholder="Bryan"
              />
            </div>
            <div className="relative border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600">
              <label
                htmlFor="name"
                className="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-gray-900"
              >
                Last Name
              </label>
              <input
                type="text"
                name="last-name"
                id="last-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                placeholder="Danielson"
              />
            </div>
            <button
              type="submit"
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-800 transition ease-in-out duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Update
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
