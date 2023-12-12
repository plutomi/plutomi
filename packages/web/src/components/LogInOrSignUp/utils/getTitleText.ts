import type { AuthContext } from "../../../hooks";

type GetTitleProps = {
  authContext: AuthContext;
  title?: string;
};

export const getTitleText = ({ authContext, title }: GetTitleProps) => {
  if (title === undefined) {
    return `Welcome${authContext === "login" ? " back" : ""}!`;
  }
  return title;
};
