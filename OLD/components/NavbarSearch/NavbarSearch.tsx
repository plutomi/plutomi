import { UsersIcon } from '@heroicons/react/solid';

export const NavbarSearch = () => (
  <div className=" flex rounded-md shadow-sm   w-full">
    <div className="relative flex items-stretch flex-grow focus-within:z-10">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <UsersIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        name="email"
        id="email"
        onChange={() => alert('This is not hooked up at the moment')}
        placeholder="Search for applicants by name, email, or phone number"
        className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md pl-10 sm:text-sm border-gray-300"
      />
    </div>
  </div>
);
