type CreateApplicantRequest = APIGatewayProxyEventV2 & {
  body: {
    orgId: string;
    openingId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

type NextIronRequest = NextApiRequest & { session: Session };
