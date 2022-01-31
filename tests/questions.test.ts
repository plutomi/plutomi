import { AXIOS_INSTANCE as axios } from "../Config";
import { nanoid } from "nanoid";
import { ERRORS } from "../Config";
import * as Openings from "../adapters/Openings";
import * as Stages from "../adapters/Stages";
import * as Questions from "../adapters/Questions";
import * as Orgs from "../adapters/Orgs";
import { AxiosResponse } from "axios";
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
    expect.assertions(2);

    try {
      await Questions.CreateQuestion({
        GSI1SK: nanoid(1),
        questionId: nanoid(1),
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  let questionId = nanoid(20);
  it("creates a question", async () => {
    expect.assertions(2);

    await Orgs.CreateOrg({ displayName: nanoid(20), orgId: nanoid(20) });

    // Create the question
    const data = await Questions.CreateQuestion({
      GSI1SK: nanoid(12),
      questionId,
    });

    expect(data.status).toBe(201);
    expect(data.data.message).toBe("Question created!");
  });

  it("blocks creating a question with the same ID", async () => {
    expect.assertions(2);
    try {
      await Questions.CreateQuestion({
        questionId,
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
    expect.assertions(3);

    try {
      await Questions.CreateQuestion({
        questionId: "",
        GSI1SK: nanoid(5),
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
    expect.assertions(3);
    try {
      await Questions.CreateQuestion({
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

  const newQuestionName = nanoid(20);
  it("allows updating a question", async () => {
    expect.assertions(2);
    const data = await Questions.UpdateQuestion(questionId, {
      GSI1SK: newQuestionName,
    });

    expect(data.status).toBe(200);
    expect(data.data.message).toBe("Question updated!");
  });

  it("allows returning a question's info", async () => {
    expect.assertions(2);
    const data = await Questions.GetQuestionInfo(questionId);
    expect(data.status).toBe(200);
    expect(data.data.GSI1SK).toBe(newQuestionName);
  });

  it("blocks updating a question id", async () => {
    expect.assertions(3);
    try {
      await Questions.UpdateQuestion(questionId, {
        // @ts-ignore - Intentional
        questionId: nanoid(10),
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.questionId");
      expect(error.response.data.message).toContain("is not allowed");
    }
  });

  it("allows deleting a question from an org", async () => {
    expect.assertions(2);
    const data = await Questions.DeleteQuestion(questionId);
    expect(data.status).toBe(200);
    expect(data.data.message).toBe("Question deleted!");
  });

  // Questions and stages
  let openingId: string;
  let stageId: string;
  questionId = nanoid(20);
  it("adds a question to a stage", async () => {
    expect.assertions(2);
    // Create an opening
    await Openings.CreateOpening({
      openingName: nanoid(10),
    });

    // Get openings in org
    const allOpenings = await Openings.GetAllOpeningsInOrg();

    // Doesn't really matter which opening we get
    openingId = allOpenings.data[0].openingId;

    // Create a stage in that opening
    await Stages.CreateStage(nanoid(10), openingId);

    // Get our stage
    const getStagesInOpening = await Stages.GetStagesInOpening(openingId);

    stageId = getStagesInOpening.data[0].stageId;

    // Create our question
    await Questions.CreateQuestion({
      GSI1SK: nanoid(10),
      questionId,
      description: nanoid(10),
    });

    try {
      const addQuestionToStage = await Questions.AddQuestionToStage(
        openingId,
        stageId,
        questionId
      );

      expect(addQuestionToStage.status).toBe(201);
      expect(addQuestionToStage.data.message).toBe("Question added to stage!");
    } catch (error) {
      console.error(error);
    }
  });

  it("blocks a user from adding the same question to a stage twice", async () => {
    expect.assertions(2);
    // Essentially the same thing as above, but expects an error instead
    try {
      await Questions.AddQuestionToStage(openingId, stageId, questionId);
    } catch (error) {
      expect(error.response.status).toBe(409);
      expect(error.response.data.message).toBe(
        `A question with the ID of '${questionId}' already exists in this stage. Please use a different question ID or delete the old one.`
      );
    }
  });

  it.todo("allows deleting a question from a stage");

  it.todo("allows adding a question at a specific position in a stage");

  it("blocks adding a question to a stage if the question does not exist", async () => {
    expect.assertions(2);
    const questionId = nanoid(50);
    try {
      await Questions.AddQuestionToStage(nanoid(10), nanoid(10), questionId);
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe(
        `A question with the ID of '${questionId}' does not exist in this org`
      );
    }
  });

  it.todo(
    "TODO - When deleting a question from an org, delete from all stages. Will require a transact write on stage update, and also a GSI to keep track of all staegs that have this question :>"
  );
});
