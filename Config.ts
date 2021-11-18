/**
 * ONLY FOR ENTITIES THAT CAN HAVE THEIR ORDER REARRANGED - Stages, questions, rules, etc.
 * We are storing the order in an array in the parent component.
 * The stageOrder is stored in the opening the stage belongs to..
 * The questionOrder is stored on the stage they belong to.. and so on.
 *
 * As more items are added, the parent item gets closer to reaching the 400kb item limit on Dynamo.
 *
 * In reality, nobody is likely to hit this threshold. If you have 200 stages in an opening.. or 200 questions in a stage.. something is deeply wrong.
 * I did a test with 3000(!!!) IDs and it came out to around 173kb, less than half of the Dynamo limit.
 * This will be a soft limit and can be raised up to a point with the understanding that performance might suffer.
 */

const NAVBAR_NAVIGATION = [
  {
    name: "Dashboard",
    href: "/dashboard",
    hiddenIfNoOrg: false,
    hiddenIfOrg: false,
  },
  {
    name: "Openings",
    href: "/openings",
    hiddenIfNoOrg: true,
    hiddenIfOrg: false,
  },
  { name: "Team", href: "/team", hiddenIfNoOrg: true, hiddenIfOrg: false },
  {
    name: "Invites",
    href: "/invites",
    hiddenIfNoOrg: false,
    hiddenIfOrg: true,
  },
];
const DROPDOWN_NAVIGATION = [
  { name: "Your Profile", href: "/profile" },
  { name: "Log Out", href: "#" },
];

// How often we should poll for invites while on the /invites page
const INVITES_REFRESH_INTERVAL = 10000;

export { NAVBAR_NAVIGATION, DROPDOWN_NAVIGATION, INVITES_REFRESH_INTERVAL };
