import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { getApplicantById } from "./getApplicantById";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function deleteApplicant({ orgId, applicantId }) {
  const applicant = (await getApplicantById({
    orgId,
    applicantId,
  })) as unknown as DynamoApplicant; // TODO fix this shit :(
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the applicant
          Delete: {
            Key: {
              PK: `ORG#${orgId}#APPLICANT#${applicantId}`,
              SK: `APPLICANT`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },

        {
          // Decrement opening's totalApplicants
          Update: {
            Key: {
              PK: `ORG#${orgId}#OPENING#${applicant.currentOpeningId}`, // todo fix types
              SK: `OPENING`,
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
              PK: `ORG#${orgId}#STAGE#${applicant.currentStageId}`, // todo fix types
              SK: `STAGE`,
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
              PK: `ORG#${orgId}`,
              SK: `ORG`,
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
    throw new Error(`Unable to delete applicant ${error}`);
  }
}
