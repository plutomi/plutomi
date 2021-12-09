import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DeleteApplicantInput } from "../../types/main";
import { getApplicantById } from "./Applicants";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function Remove(
  props: DeleteApplicantInput
): Promise<void> {
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
}
