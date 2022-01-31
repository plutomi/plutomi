import { AXIOS_INSTANCE as axios, DEFAULTS, OPENING_STATE } from "../Config";
import { nanoid } from "nanoid";
import { EMAILS, ERRORS } from "../Config";
import * as Orgs from "../adapters/Orgs";
import * as Openings from "../adapters/Openings";
import * as Stages from "../adapters/Stages";
import * as Applicants from "../adapters/Applicants";
import { DynamoNewOpening } from "../types/dynamo";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

describe("Openings", () => {
  /**
   * Creates a session cookie
   */

  let orgId = tagGenerator.generate(nanoid(20));
  let publicOpeningId;
  let privateOpeningId;
  let applicant;
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie;

    // Create an org
    await Orgs.CreateOrg({
      orgId,
      displayName: nanoid(10) + " Inc.",
    });

    // Create a public opening
    const publicOpeningName = nanoid(20);
    await Openings.CreateOpening({
      openingName: publicOpeningName,
    });

    // Get public opening
    let openings = await Openings.GetAllOpeningsInOrg();
    const publicOpening = openings.data.find(
      (opening: DynamoNewOpening) => opening.openingName === publicOpeningName
    );

    // Create a stage
    await Stages.CreateStage({
      GSI1SK: nanoid(10),
      openingId: publicOpening.openingId,
    });

    // Make the opening public
    await Openings.UpdateOpening({
      openingId: publicOpening.openingId,
      newValues: {
        GSI1SK: OPENING_STATE.PUBLIC,
      },
    });

    // Create a private opening
    const privateOpeningName = nanoid(20);

    await Openings.CreateOpening({
      openingName: privateOpeningName,
    });

    // Get private opening
    openings = await axios.get("/openings");
    const privateOpening = openings.data.find(
      (opening: DynamoNewOpening) => opening.openingName === privateOpeningName
    );

    privateOpeningId = privateOpening.openingId;

    // This one is valid
    applicant = {
      orgId,
      openingId: publicOpeningId,
      email: EMAILS.GENERAL,
      firstName: nanoid(4),
      lastName: nanoid(4),
    };
  });

  it("blocks creating an applicant in private openings", async () => {
    expect.assertions(2);
    try {
      await axios.post("/applicants", {
        ...applicant,
        openingId: privateOpeningId,
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toContain(
        "You cannot apply to this opening just yet!"
      );
    }
  });

  it("blocks creating an applicant with a spammy email", async () => {
    expect.assertions(2);
    try {
      await Applicants.CreateApplicant({
        ...applicant,
        email: "test@10minutemail.com",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain(ERRORS.EMAIL_VALIDATION);
    }
  });

  it("blocks creating applicants with long names", async () => {
    expect.assertions(4);
    try {
      await Applicants.CreateApplicant({
        ...applicant,
        firstName: nanoid(80),
        lastName: nanoid(80),
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.firstName");
      expect(error.response.data.message).toContain("body.lastName");
      expect(error.response.data.message).toContain(
        "length must be less than or equal to"
      );
    }
  });

  it("blocks creating applicants with invalid emails", async () => {
    expect.assertions(3);
    try {
      await Applicants.CreateApplicant({
        ...applicant,
        email: "beans",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.email");
      expect(error.response.data.message).toContain("must be a valid email");
    }
  });

  it("blocks creating applicants with the default org", async () => {
    expect.assertions(3);
    try {
      await Applicants.CreateApplicant({
        ...applicant,
        orgId: DEFAULTS.NO_ORG,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.orgId");
      expect(error.response.data.message).toContain(
        "contains an invalid value"
      );
    }
  });
});
