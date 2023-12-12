// What should show on the header of the login page
export const getLoggedOutPageHeader = (pathName: string) => {
  if (pathName === "/dashboard") {
    return "Log in to view your dashboard";
  }

  if (pathName === "/applications") {
    return "Log in to view your applications";
  }

  if (pathName === "/webhooks") {
    return "Log in to view your webhooks";
  }

  if (pathName === "/team") {
    return "Log in to view your team";
  }

  if (pathName === "/settings") {
    return "Log in to view your settings";
  }

  if (pathName === "/billing") {
    return "Log in to view your billing details";
  }

  return "Log in to continue.";
};
