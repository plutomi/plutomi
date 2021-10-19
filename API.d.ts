// Types for API calls, inputs and outputs
/**
 * @param GSI1SK - Name of the opening you want to create
 */
interface APICreateOpeningInput {
  GSI1SK: string;
}

/**
 * @param opening_id - ID of the opening you want to retrieve
 */
interface APIGetOpeningInput {
  opening_id: string;
}

/**
 * @param opening_id - ID of the opening you want to delete
 */
interface APIDeleteOpeningInput {
  opening_id: string;
}

/**
 * @param opening_id - ID of the opening you want to update
 * @param new_opening_values - What properties you would like to update
 */
interface APIUpdateOpeningInput {
  opening_id: string;
  new_opening_values: Any;
}
