import { AXIOS_INSTANCE as axios } from "../Config";
import { nanoid } from "nanoid";
import { ERRORS } from "../Config";

describe("Openings", () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers["set-cookie"][0];

    axios.defaults.headers.Cookie = cookie;
  });

  it("blocks creating a question if not in org", async () => {
    try {
      await axios.post("/questions");
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  const firstQuestionId = nanoid(20);
  it("creates a question", async () => {
    // Create an org first

    await axios.post("/orgs", {
      orgId: nanoid(20),
      displayName: nanoid(20),
    });
    const data = await axios.post("/questions", {
      questionId: firstQuestionId,
      GSI1SK: nanoid(20),
    });
    expect(data.status).toBe(201);
    expect(data.data.message).toBe("Question created!");
  });

  it("blocks creating a question with the same ID", async () => {
    try {
      await axios.post("/questions", {
        questionId: firstQuestionId,
        GSI1SK: nanoid(20),
      });
    } catch (error) {
      expect(error.response.status).toBe(409);
      expect(error.response.data.message).toBe(
        "A question already exists with this ID"
      );
    }
  });

  it("blocks creating questions with an empty id", async () => {
    try {
      await axios.post("/questions", {
        questionId: "",
        GSI1SK: nanoid(20),
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.questionId");
      expect(error.response.data.message).toContain(
        "is not allowed to be empty"
      );
    }
  });

  it("blocks creating questions with an empty title", async () => {
    try {
      await axios.post("/questions", {
        questionId: nanoid(20),
        GSI1SK: "",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.GSI1SK");
      expect(error.response.data.message).toContain(
        "is not allowed to be empty"
      );
    }
  });
});
// Blocks creating a question with an empty string
