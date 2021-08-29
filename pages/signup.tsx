import React, { useState } from "react";
import axios from "axios";
export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      name: name,
      user_email: email,
      password: password,
    };
    try {
      // TODO this is ugly, and should be handled in a cleaner way
      await axios.post("/api/users", body);
      const login = await axios.post("/api/login", body);
      alert("You've been logged in!");
    } catch (error) {
      try {
        await axios.post("/api/login", body);
        alert("You've been logged in!");
      } catch (error) {
        alert(error.response.data.message);
      }
    }
  };
  return (
    <div className="mx-auto mt-10 p-10  flex justify-center ">
      <form
        className="border w-4/5 md:w-2/3 lg:w-1/3 shadow-md  p-10"
        onSubmit={(e) => submitForm(e)}
      >
        <div className=" divide-y divide-gray-200">
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Create an Account
              </h3>
              {/* <p className="mt-1 text-sm text-gray-500">
                Use a permanent address where you can receive mail.
              </p> */}
            </div>
            <div className="mt-6 w-full py-4 space-y-4 ">
              <div className="sm:col-span-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                    className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-8 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Sign Up
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
