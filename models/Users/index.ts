import getInvites from "./getInvitesForUser";
import create from "./createUser";
import getByEmail from "./getUserByEmail";
import getById from "./getUserById";
import update from "./updateUser";
import createLink from "./createLoginLink";
import latestLink from "./getLatestLoginLink";
import loginEvent from "./createLoginEvent";

export const getInvitesForUser = getInvites;
export const createUser = create;
export const getUserByEmail = getByEmail;
export const getUserById = getById;
export const updateUser = update;
export const createLoginLink = createLink;
export const getLatestLoginLink = latestLink;
export const createLoginEventAndDeleteLoginLink = loginEvent;
