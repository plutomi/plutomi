import axios from "../utils/axios";
import { nanoid } from "nanoid";
import { EMAILS, ERRORS } from "../Config";
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

    try {
      // Create an org
      await axios.post("/orgs", {
        orgId,
        displayName: nanoid(10) + " Inc.",
      });
    } catch (error) {
      console.error(error);
    }

    // Create a public opening
    const publicOpeningName = nanoid(20);
    try {
      await axios.post("/openings", {
        openingName: publicOpeningName,
      });
    } catch (error) {
      console.error(error);
    }

    // Get public opening
    let openings = await axios.get("/openings");
    const publicOpening = openings.data.find(
      (opening) => opening.openingName === publicOpeningName
    );

    publicOpeningId = publicOpening.openingId;

    try {
      // Add a stage
      await axios.post("/stages", {
        openingId: publicOpeningId,
        GSI1SK: "First Stage",
      });
    } catch (error) {
      console.error(error);
    }

    // make opening public
    await axios.put(`/openings/${publicOpening.openingId}`, {
      GSI1SK: "PUBLIC",
    });

    // Create a private opening
    const privateOpeningName = nanoid(20);
    await axios.post("/openings", {
      openingName: privateOpeningName,
    });

    // Get private opening
    openings = await axios.get("/openings");
    const privateOpening = openings.data.find(
      (opening) => opening.openingName === privateOpeningName
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
    try {
      await axios.post("/applicants", {
        ...applicant,
        openingId: privateOpeningId,
      });
    } catch (error) {
      console.error(error);
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toContain(
        "You cannot apply to this opening just yet!"
      );
    }
  });

  it("blocks creating an applicant with a spammy email", async () => {
    try {
      await axios.post("/applicants", {
        ...applicant,
        email: "test@10minutemail.com",
      });
    } catch (error) {
      console.error(error);
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain(ERRORS.EMAIL_VALIDATION);
    }
  });

  it("blocks creating applicants with long names", async () => {
    try {
      await axios.post("/applicants", {
        ...applicant,
        firstName: nanoid(80),
        lastName: nanoid(80),
      });
    } catch (error) {
      console.error(error);
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.firstName");
      expect(error.response.data.message).toContain("body.lastName");
      expect(error.response.data.message).toContain(
        "length must be less than or equal to"
      );
    }
  });

  it("blocks creating applicants with invalid emails", async () => {
    try {
      await axios.post("/applicants", {
        ...applicant,
        email: "beans",
      });
    } catch (error) {
      console.error(error);
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.email");
      expect(error.response.data.message).toContain("must be a valid email");
    }
  });

  it("blocks creating applicants with the default org", async () => {
    try {
      await axios.post("/applicants", {
        ...applicant,
        orgId: "NO_ORG_ASSIGNED",
      });
    } catch (error) {
      console.error(error);
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.orgId");
      expect(error.response.data.message).toContain(
        "contains an invalid value"
      );
    }
  });
});
