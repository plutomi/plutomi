import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import {
  GetQuestionsInStageInput,
  GetQuestionsInStageOutput,
} from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function GetQuestions(
  // THIS IS A TODO!
  // TODO TODO TODO
  props: GetQuestionsInStageInput
): Promise<[GetQuestionsInStageOutput, null] | [null, SdkError]> {
// }
//   const { orgId, stageId, questionOrder } = props;

//   const params: QueryCommandInput = {
//     IndexName: "GSI1",
//     TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

//     KeyConditionExpression: "GSI1PK = :GSI1PK",
//     ExpressionAttributeValues: {
//       ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}#${ENTITY_TYPES.QUESTION}S`,
//     },
//   };

//   try {
//     const allQuestions = await Dynamo.send(new QueryCommand(params));

//     // Sort questions in the same order of the stage before sending it back
//     const result = questionOrder.map((i) =>
//       allQuestions.Items.find((j) => j.questionId === i)
//     );

//     return [result as GetQuestionsInStageOutput, null];
//   } catch (error) {
//     return [null, error];
//   }
// }
