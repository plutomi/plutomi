import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import Time from "../time";
import { nanoid } from "nanoid";
import { ENTITY_TYPES, ID_LENGTHS } from "../../Config";
import { CreateApplicantInput, CreateApplicantOutput } from "../../types/main";
import { DynamoNewApplicant } from "../../types/dynamo";
const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Creates an applicant in a given org
 * @param props {@link CreateApplicantInput}
 * @returns - {@link CreateApplicantOutput}
 */
export async function createApplicant(
  props: CreateApplicantInput
): Promise<CreateApplicantOutput> {
  const { orgId, firstName, lastName, email, openingId, stageId } = props;

  const now = Time.currentISO();

  // Applicant ID has to be pretty high as the apply link will be their application link
  // https://zelark.github.io/nano-id-cc/
  const applicantId = nanoid(ID_LENGTHS.APPLICANT);

  const newApplicant: DynamoNewApplicant = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}#${applicantId}`,
    SK: ENTITY_TYPES.APPLICANT,
    firstName: firstName,
    lastName: lastName,
    fullName: `${firstName} ${lastName}`, // TODO Dynamo sorts in lexigraphical order.. migth need to .uppercase these
    email: email.toLowerCase().trim(),
    isemailVerified: false,
    orgId: orgId,
    applicantId: applicantId,
    entityType: ENTITY_TYPES.APPLICANT,
    createdAt: now,
    // TODO add phone number
    openingId: openingId,
    stageId: stageId,

    /**
     * The below might seem silly and it does look like we have a dead index. Which we do! Sort of.. :)
     *
     * By having two separate indexes that do almost the same thing, we can have the following access patterns:
     *
     * 1. Get all applicants in org
     * 2. Get all applicants in an opening
     * 3. Get all applicants in a stage, no opening Id required
     *
     * but also!
     *
     * 4. Get all applicants in the opening of `IT Director` that applied in the last month
     * 5. Get all applicants in the opening of `IT Director` that applied in the last month, that landed on `Interviewing` in the past week
     *
     * or any variations. Date Landed is a useful metric at high scales as you might want to send applicants that landed on a `Ready to Drive`
     * stage in the past week an email to start making deliveries for a bonus incentive... as an example ;)
     *
     * Before we had `${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#{stageId}` as the only GSI.
     *
     * While this *does* allow getting all applicants in a specific stage or in an opening, you will have to:
     * 1. Get all openings in an org
     * 2. Get all stages for that opening
     * 3. Filter for the stage that you want
     * 4. Get all applicants in that stage
     *
     * And you *technically* could add a DATE_LANDED at the end, but this would only be for the opening or stage landed date.
     * These new queries allow us to filter independently of the opening AND/OR stage.
     *
     *
     */
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}S`,
    GSI1SK: `${ENTITY_TYPES.OPENING}#${openingId}#DATE_LANDED#${now}`,
    GSI2PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}S`,
    GSI2SK: `${ENTITY_TYPES.STAGE}#${stageId}#DATE_LANDED#${now}`,
  };

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Add an applicant item
          Put: {
            Item: newApplicant,
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },

        {
          // Increment the opening's totalApplicants
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
              SK: ENTITY_TYPES.OPENING,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET totalApplicants = if_not_exists(totalApplicants, :zero) + :value",
            ExpressionAttributeValues: {
              ":zero": 0,
              ":value": 1,
            },
          },
        },
        {
          // Increment the stage's total applicants
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
              SK: ENTITY_TYPES.STAGE,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET totalApplicants = if_not_exists(totalApplicants, :zero) + :value",
            ExpressionAttributeValues: {
              ":zero": 0,
              ":value": 1,
            },
          },
        },
        {
          // Increment the org's total applicants
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}`,
              SK: ENTITY_TYPES.ORG,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET totalApplicants = if_not_exists(totalApplicants, :zero) + :value",
            ExpressionAttributeValues: {
              ":zero": 0,
              ":value": 1,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return newApplicant;
  } catch (error) {
    // TODO error enum
    throw new Error(error);
  }
}
