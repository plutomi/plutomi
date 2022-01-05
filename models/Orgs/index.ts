import get from "./getOrgById";
import createAndJoin from "./createAndJoinOrg";
import getUsers from "./getUsersInOrg";
import getOpenings from "./getOpeningsInOrg";
import leaveAndDelete from "./leaveAndDeleteOrg";
import invites from "./getInvitesInOrg";
export const getOrgById = get;
export const createAndJoinOrg = createAndJoin;
export const getUsersInOrg = getUsers;
export const getOpeningsInOrg = getOpenings;
export const leaveAndDeleteOrg = leaveAndDelete;
export const getPendingInvites = invites;
