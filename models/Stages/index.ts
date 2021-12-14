import {
  GetCommand,
  GetCommandInput,
  QueryCommand,
  QueryCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import * as Time from "../../utils/time";
import { nanoid } from "nanoid";
import {
  ENTITY_TYPES,
  ERRORS,
  FORBIDDEN_PROPERTIES,
  ID_LENGTHS,
  LIMITS,
} from "../../Config";
import {
  DeleteStageInput,
  GetAllApplicantsInStageInput,
  GetAllApplicantsInStageOutput,
  GetAllQuestionsInStageInput,
  GetAllQuestionsInStageOutput,
  GetStageByIdInput,
  GetStageByIdOutput,
  UpdateStageInput,
} from "../../types/main";
import _ from "lodash";
const { DYNAMO_TABLE_NAME } = process.env;

import create from "./createStage";
import remove from "./deleteStage";
import update from "./updateStage";
import getStage from "./getStageById";
import getApplicants from "./getApplicantsInStage";
import getQuestions from "./getQuestionsInStage";
export const createStage = create;
export const deleteStage = remove;
export const updateStage = update;
export const getStageById = getStage;
export const getApplicantsInStage = getApplicants;
export const getQuestionsInStage = getQuestions;
