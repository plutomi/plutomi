/**
 * For entities such as stages, questions in a stage, rules in a question.. things that have an order..
 * We are storing their IDs as an array in the parent component:
 * The stage_order is stored in the opening the stage belongs to..
 * The question order is stored on the stage they belong to.. and so on.
 *
 *
 * In reality, nobody is likely to hit this threshold. If you have 500 stages in an opening.. or 500 questions in a stage.. something is deeply wrong.
 * But due to the 400kb limit on Dynamo, we do have to limit this. I did a test with 3000(!!!) IDs and it came out to around 173kb, less than half of the Dynamo limit
 */
const MAX_ITEM_LIMIT = 200;
const MAX_ITEM_LIMIT_ERROR_MESSAGE =
  "MAX_ITEM_LIMIT reached, please contact support@plutomi.com for assistance";

export { MAX_ITEM_LIMIT, MAX_ITEM_LIMIT_ERROR_MESSAGE };
