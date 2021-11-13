// Types for the actual items that go into Dynamo DB
// Makes it easier to reference all variables in the front end

interface DynamoUser {
  createdAt?: string;
  entityType?: string;
  userEmail?: string;
  orgId?: string;
  fullName?: string;
  GSI1SK?: string;
  GSI2SK?: string;
  GSI2PK?: string;
  GSI1PK?: string;
  userId?: string;
  lastName?: string;
  orgJoinDate?: string;
  firstName?: string;
  SK?: string;
  totalInvites;
  PK?: string;
}

interface DynamoOpening {
  PK: string;
  SK: "OPENING";
  entityType: "OPENING";
  createdAt: string;
  openingId: string;
  GSI1PK: string;
  GSI1SK: string;
  totalApplicants: number;
  isPublic: boolean;
  stageOrder: string[];
  totalStages: 0;
  totalOpenings: 0;
  totalApplicants: 0;
}

interface DynamoStage {
  PK: string;
  SK: `STAGE`;
  entityType: "STAGE";
  createdAt: string;
  stageId: string;
  totalApplicants: number;
  questionOrder: string[];
  openingId: string;
  GSI1PK: string;
  GSI1SK: string;
}

interface DynamoOrgInvite {
  PK: string;
  SK: string;
  orgId: string;
  createdBy: DynamoUser;
  entityType: "ORG_INVITE";
  createdAt: string;
  expiresAt: string;
  inviteId: string;
  GSI1PK: string;
  GSI1SK: string;
}

interface DynamoStageQuestion {
  PK: string;
  SK: string;
  questionDescription: string;
  questionId: string;
  entityType: string;
  createdAt: string;
  GSI1PK: string;
  GSI1SK: string;
}

interface DynamoOrg {
  PK: string;
  SK: `ORG`;
  orgId: string;
  entityType: "ORG";
  createdAt: string;
  GSI1PK: `ORG`;
  GSI1SK: string;
  totalUsers: number;
  totalOpenings: number;
  totalStages: number;
  totalApplicants: number;
}

interface DynamoApplicant {
  PK: string;
  SK: `APPLICANT`;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  applicantId: string;
  orgId: string;
  entityType: "APPLICANT";
  createdAt: CustomDateFormat;
  currentOpeningId: string;
  currentStageId: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: string;
  APPLICANT_RESPONSE?: DynamoApplicantResponse[];
  responses?: DynamoApplicantResponse[]; // Now is returned when getting applicant by ID
}

interface DynamoApplicantResponse {
  PK: string;
  SK: `APPLICANT_RESPONSE`;
  orgId: string;
  applicantId: string;
  entityType: "APPLICANT_RESPONSE";
  questionTitle: string;
  questionDescription: string;
  questionResponse: any;
  createdAt: string;
  responseId: string;
  GSI1PK: string;
  GSI1SK: APPLICANT_RESPONSE;
}
