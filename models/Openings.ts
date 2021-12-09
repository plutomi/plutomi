import {
    GetCommand,
    GetCommandInput,
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
  GetOpeningByIdInput,
  UpdateApplicantInput,
} from "../types/main";
import {
  DynamoNewApplicant,
  DynamoNewApplicantResponse,
  DynamoNewOpening,
} from "../types/dynamo";
import _ from "lodash";
const { DYNAMO_TABLE_NAME } = process.env;

export const getOpeningById = async (
  props: GetOpeningByIdInput
): Promise<DynamoNewOpening> => {
  const { orgId, openingId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
      SK: ENTITY_TYPES.OPENING,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item as DynamoNewOpening;
  } catch (error) {
    throw new Error(error);
  }
};
