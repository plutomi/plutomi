import type { AuthContext } from "@/hooks";

type GetSubheaderActionProps = {
  subTitle?: string;
  authContext: AuthContext;
};

export const getSubheaderAction = ({
  subTitle,
  authContext
}: GetSubheaderActionProps) => {
  if (subTitle !== undefined) {
    return "continue";
  }

  if (authContext === "login") {
    return "log in";
  }
  return "sign up";
};
