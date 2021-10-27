import AuthService from "./adapters/AuthService";
import UsersService from "./adapters/UsersService";
import { mutate } from "swr";

/**
 * ONLY FOR ENTITIES THAT CAN HAVE THEIR ORDER REARRANGED - Stages, questions, rules, etc.
 * We are storing the order in an array in the parent component.
 * The stage_order is stored in the opening the stage belongs to..
 * The question_order is stored on the stage they belong to.. and so on.
 *
 * As more items are added, the parent item gets closer to reaching the 400kb item limit on Dynamo.
 *
 * In reality, nobody is likely to hit this threshold. If you have 200 stages in an opening.. or 200 questions in a stage.. something is deeply wrong.
 * I did a test with 3000(!!!) IDs and it came out to around 173kb, less than half of the Dynamo limit.
 * This will be a soft limit and can be raised up to a point with the understanding that performance might suffer.
 */
const MAX_CHILD_ITEM_LIMIT = 200;
const MAX_ITEM_LIMIT_ERROR =
  "MAX_CHILD_ITEM_LIMIT reached, please contact support@plutomi.com for assistance";

const NAVBAR_NAVIGATION = [
  { name: "Dashboard", href: "/dashboard", hidden_if_no_org: false },
  { name: "Openings", href: "/openings", hidden_if_no_org: true },
  { name: "Team", href: "/team", hidden_if_no_org: true },
];
const DROPDOWN_NAVIGATION = [
  { name: "Your Profile", href: "/profile" },
  { name: "Log Out", href: "#" },
];

export {
  MAX_CHILD_ITEM_LIMIT,
  MAX_ITEM_LIMIT_ERROR,
  NAVBAR_NAVIGATION,
  DROPDOWN_NAVIGATION,
};
