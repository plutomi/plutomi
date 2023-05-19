import type { Application } from "./application";
import type { Invite } from "./invite";
import type { Membership } from "./membership";
import type { Org } from "./org";
import type { User } from "./user";
import type { Question } from "./question";
import type { Stage } from "./stage";
import type { StageQuestionItem } from "./stageQuestionItem";
import type { Workspace } from "./workspace";

export type AllEntities =
  | Application
  | Invite
  | Membership
  | Org
  | User
  | Question
  | Stage
  | StageQuestionItem
  | Workspace;

export * from "./allEntityNames";
