import { PlutomiId } from '../../utils';
import { Email } from '../email';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

type UserTotals = {
  invites: number;
  memberships: number;
  workspaces: number;
};

type Entity = AllEntityNames.User;
type UserOrgId = PlutomiId<AllEntityNames.Org> | null;
type UserWorkspaceId = PlutomiId<AllEntityNames.Workspace> | null;

type UserTargetArray = [
  ...IndexedTargetArray<Entity>,
  // Get all users in an org
  { id: UserOrgId; type: IndexableType.User },
  // Get all users in a workspace
  { id: UserWorkspaceId; type: IndexableType.User },
  // Get a user by email
  { id: Email; type: IndexableType.Email },
];

export type User = BaseEntity<Entity> & {
  firstName: string;
  lastName: string;
  org: UserOrgId;
  workspace: UserWorkspaceId;
  email: Email;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totals: UserTotals;
  target: UserTargetArray;
};
