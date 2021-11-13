// Types for API calls, inputs and outputs
/**
 * @param GSI1SK - Name of the opening you want to create
 */
interface APICreateOpeningInput {
  GSI1SK: string;
}

/**
 * @param openingId - ID of the opening you want to retrieve
 */
interface APIGetOpeningInput {
  openingId: string;
}

/**
 * @param openingId - ID of the opening you want to delete
 */
interface APIDeleteOpeningInput {
  openingId: string;
}

/**
 * @param openingId - ID of the opening you want to update
 * @param newOpeningValues - What properties you would like to update
 */
interface APIUpdateOpeningInput {
  openingId: string;
  newOpeningValues: Any;
}

/**
 * @param GSI1SK - Name of the stage you want to create
 */

interface APICreateStageInput {
  GSI1SK: string;
  openingId: string;
}

/**
 * @param openingId - ID of the opening the stage is in
 * @param stageId - ID of the stage you want to return
 */
interface APIGetStageInput {
  stageId: string;
}

interface APIGetStageURLInput {
  stageId: string;
}
/**
 * @param openingId - ID of the opening you want to retrieve all stages for
 */
interface APIGetAllStagesInOpeningInput {
  openingId: string;
}
interface APIGetAllStagesInOpeningURL {
  openingId: string;
}

/**
 * @param openingId - ID of the opening the stage is in
 * @param stageId - ID of the stage you want to delete
 *
 */
interface APIDeleteStageInput {
  openingId: string;
  stageId: string;
}

/**
 * @param userId - For mutate calls, to refresh the user
 */
interface APIGetUserURL {
  userId: string;
}

/**
 * @param userId - ID of the user you want to retrieve
 */
interface APIGetUserInput {
  userId: string;
}

/**
 * @param orgId - The ID of the org you want to retrieve the users for
 */
interface APIGetAllUsersInOrgURL {
  orgId: string;
}

interface APIGetAllUsersInOrg {
  orgId: string;
}

/**
 * @param userId - ID of the user you want to update
 * @param newUserValues - Properties you want to update on the user
 */
interface APIUpdateUserInput {
  userId: string;
  newUserValues: Any;
}

interface APIGetInvitesURL {
  userId: string;
}

interface APIGetInvites {
  userId: string;
}

interface APICreateInviteInput {
  recipientEmail: string;
}

interface APIRejectInviteInput {
  timestamp: string;
  inviteId: string;
}

interface APIAcceptInviteInput {
  timestamp: string;
  inviteId: string;
  orgId: string;
}
