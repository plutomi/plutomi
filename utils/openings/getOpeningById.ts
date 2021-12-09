import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewOpening } from "../../types/dynamo";
import { GetOpeningByIdInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;

