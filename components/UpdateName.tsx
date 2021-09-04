import { useState } from "react";
import axios from "axios";
export default function UpdateName({ user_id }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const updateUser = async (e) => {
    e.preventDefault();

    const body = {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
    };

    try {
      const { status, data } = await axios.put(`/api/users/${user_id}`, body);

      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="p-8 border rounded-md">
      <div>
        <h3 className="text-xl leading-6 font-medium text-gray-900">
          We need some basic info to get started
        </h3>
      </div>
      <div></div>
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label
            htmlFor="first-name"
            className="block text-sm font-medium text-gray-700"
          >
            First name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="first-name"
              id="first-name"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="sm:col-span-3">
          <label
            htmlFor="last-name"
            className="block text-sm font-medium text-gray-700"
          >
            Last name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="last-name"
              id="last-name"
              required
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => updateUser(e)}
        className="mt-8 justify-self-end inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Update name
      </button>
    </div>
  );
}
