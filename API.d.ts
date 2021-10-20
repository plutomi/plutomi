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

/**
 * @param GSI1SK - Name of the stage you want to create
 */

interface APICreateStageInput {
  GSI1SK: string;
  opening_id: string;
}

/**
 * @param opening_id - ID of the opening the stage is in
 * @param stage_id - ID of the stage you want to return
 */
interface APIGetStageInput {
  opening_id: string;
  stage_id: string;
}

interface APIGetStageURLInput {
  opening_id: string;
  stage_id: string;
}
/**
 * @param opening_id - ID of the opening you want to retrieve all stages for
 */
interface APIGetAllStagesInOpeningInput {
  opening_id: string;
}
interface APIGetAllStagesInOpeningURL {
  opening_id: string;
}

/**
 * @param opening_id - ID of the opening the stage is in
 * @param stage_id - ID of the stage you want to delete
 *
 */
interface APIDeleteStageInput {
  opening_id: string;
  stage_id: string;
}

interface APIUpdateStageInput {
  opening_id: string;
  stage_id: string;
  new_stage_values: Any;
}
