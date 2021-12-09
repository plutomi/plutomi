import {
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../awsClients/ddbDocClient";
import * as Time from "../utils/time";
import { nanoid } from "nanoid";
import { ENTITY_TYPES, FORBIDDEN_PROPERTIES, ID_LENGTHS } from "../Config";
import {
  CreateApplicantInput,
  CreateApplicantOutput,
  CreateApplicantResponseInput,
  CreateApplicantResponseOutput,
  DeleteApplicantInput,
  GetApplicantByIdInput,
  GetApplicantByIdOutput,
  UpdateApplicantInput,
} from "../types/main";
import {
  DynamoNewApplicant,
  DynamoNewApplicantResponse,
} from "../types/dynamo";
import _ from "lodash";
const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Creates an applicant in a given org
 * @param props {@link CreateApplicantInput}
 * @returns - {@link CreateApplicantOutput}
 */
export const createApplicant = async (
  props: CreateApplicantInput
): Promise<CreateApplicantOutput> => {
  const { orgId, firstName, lastName, email, openingId, stageId } = props;

  const now = Time.currentISO();
  const applicantId = nanoid(ID_LENGTHS.APPLICANT);

  const newApplicant: DynamoNewApplicant = {
    PK: `${ENTITY_TYPES.APPLICANT}#${applicantId}`,
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

    /** // TODO revisit this below
     * The below might seem silly and it does look like we have a dead index. Which we do! Sort of.. :)
     *
     * By having two separate indexes that do almost the same thing, we can have the following access patterns:
     *
     * 1. Get all applicants in org
     * 2. Get all applicants in an opening
     * 3. Get all applicants in a stage, no opening ID required. We can query for all stages that = "Questionnaire" and get all applicants in those stages.
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
    // TODO reqork this
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}S`, // TODO needs sharding
    GSI1SK: `${ENTITY_TYPES.OPENING}#${openingId}#DATE_LANDED#${now}`,
    GSI2PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}S`, // TODO needs sharding
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
};

export const getApplicantById = async (
  props: GetApplicantByIdInput
): Promise<GetApplicantByIdOutput> => {
  const { applicantId } = props;
  const responsesParams: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "PK = :PK AND begins_with(SK, :SK)",
    ExpressionAttributeValues: {
      ":PK": `${ENTITY_TYPES.APPLICANT}#${applicantId}`,
      ":SK": ENTITY_TYPES.APPLICANT,
    },
  };

  try {
    // TODO refactor for promise all / transact
    const allApplicantInfo = await Dynamo.send(
      new QueryCommand(responsesParams)
    );

    const grouped = _.groupBy(allApplicantInfo.Items, "entityType");

    const metadata = grouped.APPLICANT[0] as CreateApplicantOutput;
    const responses = grouped.APPLICANT_RESPONSE;
    // TODO files

    const applicant: GetApplicantByIdOutput = {
      ...metadata,
      responses: responses,
      // TODO files
    };
    return applicant; // TODO TYPE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteApplicant = async (
  props: DeleteApplicantInput
): Promise<void> => {
  const { orgId, applicantId } = props;
  const applicant = await getApplicantById({
    applicantId,
  });

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the applicant
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.APPLICANT}#${applicantId}`,
              SK: ENTITY_TYPES.APPLICANT,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },

        {
          // Decrement opening's totalApplicants
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${applicant.openingId}`, // todo fix types
              SK: ENTITY_TYPES.OPENING,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET totalApplicants = totalApplicants - :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
        {
          // Decrement stage's totalApplicants
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${applicant.stageId}`, // todo fix types
              SK: ENTITY_TYPES.STAGE,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET totalApplicants = totalApplicants - :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
        {
          // Decrement the org's total applicants
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}`,
              SK: ENTITY_TYPES.ORG,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET totalApplicants = totalApplicants - :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to delete applicant ${error}`); // TODO add to errors
  }
};

export const updateApplicant = async (
  props: UpdateApplicantInput
): Promise<void> => {
  const { orgId, applicantId, newApplicantValues } = props;

  // Build update expression
  let allUpdateExpressions: string[] = [];
  let allAttributeValues: any = {};

  // Filter out forbidden property
  for (const property in newApplicantValues) {
    if (FORBIDDEN_PROPERTIES.APPLICANT.includes(property)) {
      // Delete the property so it isn't updated
      delete newApplicantValues[property];
    }

    // If its a valid property, start creating the new update expression
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newApplicantValues[property];
  }

  const params: UpdateCommandInput = {
    Key: {
      PK: `${ENTITY_TYPES.APPLICANT}#${applicantId}`,
      SK: ENTITY_TYPES.APPLICANT,
    },
    UpdateExpression: `SET ` + allUpdateExpressions.join(", "),
    ExpressionAttributeValues: allAttributeValues,
    TableName: DYNAMO_TABLE_NAME,
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
  } catch (error) {
    throw new Error(error);
  }
};

export const createApplicantResponse = async (
  props: CreateApplicantResponseInput
): Promise<CreateApplicantResponseOutput> => {
  const {
    orgId,
    applicantId,
    questionTitle,
    questionDescription,
    questionResponse,
  } = props;
  const responseId = nanoid(ID_LENGTHS.APPLICANT_RESPONSE);
  const newApplicantResponse: DynamoNewApplicantResponse = {
    PK: `${ENTITY_TYPES.APPLICANT}#${applicantId}`,
    SK: `${ENTITY_TYPES.APPLICANT_RESPONSE}#${responseId}`,
    orgId: orgId,
    applicantId: applicantId,
    entityType: ENTITY_TYPES.APPLICANT_RESPONSE,
    createdAt: Time.currentISO(),
    responseId: responseId,
    questionTitle: questionTitle,
    questionDescription: questionDescription,
    questionResponse: questionResponse,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}#${applicantId}`,
    GSI1SK: ENTITY_TYPES.APPLICANT_RESPONSE, // TODO add timestmap?
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: newApplicantResponse,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return newApplicantResponse;
  } catch (error) {
    // TODO error enum
    throw new Error(error);
  }
};
