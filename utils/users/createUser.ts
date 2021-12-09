import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import * as Time from "../time";
import { nanoid } from "nanoid";
import { getUserByEmail } from "./getUserByEmail";
import { EMAILS, ENTITY_TYPES, ID_LENGTHS, DEFAULTS } from "../../Config";
import sendEmail from "../sendEmail";
import { CreateUserInput } from "../../types/main";
import { DynamoNewUser } from "../../types/dynamo";
const { DYNAMO_TABLE_NAME } = process.env;


