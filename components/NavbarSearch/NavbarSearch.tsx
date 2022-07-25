import { UsersIcon } from '@heroicons/react/solid';

export const NavbarSearch = () => (
  <div className=" flex rounded-md shadow-sm   w-full">
    <div className="relative flex items-stretch flex-grow focus-within:z-10">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <UsersIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
    </div>
  </div>
);
