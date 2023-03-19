import { Application } from './application';
import { Invite } from './invite';
import { Membership } from './membership';
import { Org } from './org';
import { User } from './user';
import { Question } from './question';
import { Stage } from './stage';
import { StageQuestionItem } from './stageQuestionItem';
import { Workspace } from './workspace';
import { LoginLink } from './loginLink';

export type AllEntities =
  | Application
  | Invite
  | Membership
  | Org
  | User
  | Question
  | Stage
  | StageQuestionItem
  | Workspace
  | LoginLink;
