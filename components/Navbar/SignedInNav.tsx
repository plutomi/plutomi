import { Fragment } from "react";
import useSelf from "../../SWR/useSelf";
import NavbarSearch from "./NavbarSearch";
import AuthService from "../../adapters/AuthService";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { NAVBAR_NAVIGATION, DROPDOWN_NAVIGATION } from "../../Config";
import { useRouter } from "next/router";
import {
  BellIcon,
  DotsHorizontalIcon,
  MenuIcon,
  XIcon,
} from "@heroicons/react/outline";
import Link from "next/dist/client/link";
import Banner from "../BannerTop";
import { mutate } from "swr";
import UsersService from "../../adapters/UsersService";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SignedInNav({ current }) {
  const router = useRouter();
  const { user, isUserLoading, isUserError } = useSelf();

  const handleLogout = async () => {
    try {
      const { message } = await AuthService.logout();
      alert(message);
      // TODO reroute to homepage
    } catch (error) {
      alert(error.response.message);
    }

    mutate(UsersService.getSelfURL()); // Refresh login state - shows login page
  };

  return (
    <>
      {user?.totalInvites > 0 && current !== "Invites" && (
        <Banner
          msgSmall={"You've been invited!"}
          msgLarge={"You've been invited to join an organization!"}
          btnText={"View invites"}
          href={"/invites"}
        />
      )}

      <Disclosure as="nav" className="bg-white border-b border-gray-200">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 ">
                <div className="flex justify-between  w-2/3">
                  {/*<div className="flex-shrink-0 flex items-center">
                  <img
                    className="block lg:hidden h-8 w-auto"
                    src="https://tailwindui.com/img/logos/workflow-mark-blue-600.svg"
                    alt="Workflow"
                  />
                  <img
                    className="hidden lg:block h-8 w-auto"
                    src="https://tailwindui.com/img/logos/workflow-logo-blue-600-mark-gray-800-text.svg"
                    alt="Workflow"
                  /> 
                  </div>*/}
                  <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                    {NAVBAR_NAVIGATION.map((item) => {
                      if (
                        user?.orgId === "NO_ORG_ASSIGNED" &&
                        item.hidden_if_no_org
                      ) {
                        return null;
                      }

                      if (
                        user?.orgId !== "NO_ORG_ASSIGNED" &&
                        item.hidden_if_org
                      ) {
                        return null;
                      }
                      return (
                        <Link key={item.name} href={item.href}>
                          <a
                            className={classNames(
                              current === item.name
                                ? "border-blue-500 text-dark"
                                : "border-transparent text-light hover:border-blue-gray-300 hover:text-dark",
                              "inline-flex items-center px-1 pt-1 border-b-2 text-md font-medium"
                            )}
                            aria-current={
                              current === item.name ? "page" : undefined
                            }
                          >
                            {item.name}
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div className="  w-1/2  justify-center mx-2 flex items-center">
                  <NavbarSearch />
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center ">
                  {/* <button
                    type="button"
                    className="bg-white p-1 rounded-full text-light hover:text-normal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button> */}

                  {/* Profile dropdown */}

                  <Menu as="div" className="ml-3 relative">
                    <div>
                      <Menu.Button className="max-w-xs bg-white flex items-center text-md rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <span className="sr-only">Open user menu</span>
                        {/* <img
                          className="h-8 w-8 rounded-full"
                          src={user?.imageUrl}
                          alt=""
                        /> */}
                        <button>
                          <DotsHorizontalIcon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        </button>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-96 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 text-md border-dashed border-b-2">
                          {isUserLoading ? (
                            "Loading user info..."
                          ) : (
                            <>
                              {!user?.GSI1SK.includes("NO_FIRST_NAME") ||
                                (!user?.GSI1SK.includes("NO_LAST_NAME") && (
                                  <div className="   text-dark ">
                                    Signed in as ${user?.GSI1SK}
                                  </div>
                                ))}

                              <div className=" text-light">
                                {user?.userEmail}
                              </div>
                            </>
                          )}
                        </div>

                        {DROPDOWN_NAVIGATION.map((item) =>
                          item.name == "Log Out" ? (
                            <div
                              className="cursor-pointer"
                              key={item.name}
                              onClick={() => handleLogout()}
                            >
                              <Menu.Item>
                                {({ active }) => (
                                  <a
                                    className={classNames(
                                      active ? "bg-blue-gray-100" : "",
                                      "block px-4 py-2 text-md text-dark"
                                    )}
                                  >
                                    {item.name}
                                  </a>
                                )}
                              </Menu.Item>
                            </div>
                          ) : (
                            <Link href={item.href}>
                              <div className="cursor-pointer" key={item.name}>
                                <Menu.Item>
                                  {({ active }) => (
                                    <a
                                      className={classNames(
                                        active ? "bg-blue-gray-100" : "",
                                        "cusror-auto block px-4 py-2 text-md text-dark"
                                      )}
                                    >
                                      {item.name}
                                    </a>
                                  )}
                                </Menu.Item>
                              </div>
                            </Link>
                          )
                        )}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-light hover:text-normal hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
                {NAVBAR_NAVIGATION.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      current === item.name
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                      "block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                    )}
                    aria-current={current === item.name ? "page" : undefined}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    {/* <img
                    className="h-10 w-10 rounded-full"
                    src={user?.imageUrl}
                    alt=""
                  /> */}
                  </div>

                  {isUserLoading ? (
                    "Loading user info..."
                  ) : (
                    <>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">
                          {user?.GSI1SK}
                        </div>
                        <div className="text-md font-medium text-normal">
                          {user?.userEmail}
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => handleLogout()}
                    className="ml-auto bg-white flex-shrink-0 p-1 rounded-full text-light hover:text-normal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Log Out</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1">
                  {DROPDOWN_NAVIGATION.map((item) => {
                    {
                      item.name === "Log Out" ? (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={() => handleLogout()}
                          className="block px-4 py-2 text-base font-medium text-normal hover:text-gray-800 hover:bg-gray-100"
                        >
                          {item.name}
                        </a>
                      ) : (
                        <Link key={item.name} href={item.href}>
                          <a className="block px-4 py-2 text-base font-medium text-normal hover:text-gray-800 hover:bg-gray-100">
                            {item.name}
                          </a>
                        </Link>
                      );
                    }
                  })}
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </>
  );
}
