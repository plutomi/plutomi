import { AXIOS_INSTANCE as axios } from "../Config";
import { nanoid } from "nanoid";
import { ERRORS } from "../Config";
import * as Openings from "../adapters/Openings";
import * as Stages from "../adapters/Stages";
import * as Questions from "../adapters/Questions";
import * as Orgs from "../adapters/Orgs";
import { DynamoNewQuestion, DynamoNewStage } from "../types/dynamo";

describe("Questions", () => {
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
    const data = await Questions.UpdateQuestion({
      questionId,
      newValues: {
        GSI1SK: newQuestionName,
      },
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
      await Questions.UpdateQuestion({
        questionId,
        newValues: {
          questionId: nanoid(10),
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.questionId");
      expect(error.response.data.message).toContain("is not allowed");
    }
  });

  it("allows deleting a question from an org", async () => {
    expect.assertions(2);
    const data = await Questions.DeleteQuestionFromOrg(questionId);
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
    await Stages.CreateStage({
      GSI1SK: nanoid(10),
      openingId,
    });

    // Get our stage
    const getStagesInOpening = await Stages.GetStagesInOpening(openingId);

    stageId = getStagesInOpening.data[0].stageId;

    // Create our question
    await Questions.CreateQuestion({
      GSI1SK: nanoid(10),
      questionId,
      description: nanoid(10),
    });

    const addQuestionToStage = await Questions.AddQuestionToStage({
      openingId,
      stageId,
      questionId,
    });

    expect(addQuestionToStage.status).toBe(201);
    expect(addQuestionToStage.data.message).toBe("Question added to stage!");
  });

  it("blocks a user from adding the same question to a stage twice", async () => {
    expect.assertions(2);
    // Essentially the same thing as above, but expects an error instead
    try {
      await Questions.AddQuestionToStage({ openingId, stageId, questionId });
    } catch (error) {
      expect(error.response.status).toBe(409);
      expect(error.response.data.message).toBe(
        `A question with the ID of '${questionId}' already exists in this stage. Please use a different question ID or delete the old one.`
      );
    }
  });

  it("allows adding a question at a specific position in a stage", async () => {
    expect.assertions(3);

    // We're going to add question 1 to the END
    // And question 2 as the first question
    let questionId1 = nanoid(20);
    let questionId2 = nanoid(20);

    // Create the questions
    await Questions.CreateQuestion({
      GSI1SK: nanoid(10),
      questionId: questionId1,
    });

    await Questions.CreateQuestion({
      GSI1SK: nanoid(10),
      questionId: questionId2,
    });

    // Add question 1 to the end
    await Questions.AddQuestionToStage({
      openingId,
      stageId,
      questionId: questionId1,
    });
    // Add question 2 to the beginning
    await Questions.AddQuestionToStage({
      openingId,
      stageId,
      questionId: questionId2,
      position: 0,
    });

    const updatedStage = await Stages.GetStageInfo({
      openingId,
      stageId,
    });

    expect(updatedStage.data.questionOrder.length).toBeGreaterThanOrEqual(2);
    // Last item
    expect(updatedStage.data.questionOrder.slice(-1)[0]).toBe(questionId1);
    // First item
    expect(updatedStage.data.questionOrder[0]).toBe(questionId2);
  });

  it("blocks updating the questionOrder with ID's that do not exist", async () => {
    expect.assertions(2);

    // Attempt to modify the question order with questionIds that don't exist
    const ourStage = await Stages.GetStageInfo({
      openingId,
      stageId,
    });
    ourStage.data.questionOrder.splice(0, 1, "123");
    try {
      await Stages.UpdateStage({
        openingId,
        stageId,
        newValues: {
          questionOrder: ourStage.data.questionOrder,
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(
        "The questionIds in the 'questionOrder' property differ from the ones in the stage, please check your request and try again."
      );
    }
  });
  it("blocks adding a question to a stage if the question does not exist", async () => {
    expect.assertions(2);
    const questionId = nanoid(50);
    try {
      await Questions.AddQuestionToStage({
        openingId: nanoid(20),
        stageId: nanoid(20),
        questionId,
      });
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe(
        `A question with the ID of '${questionId}' does not exist in this org`
      );
    }
  });

  it("returns an error if attempting to delete a question that doesn't exist in the stage", async () => {
    expect.assertions(2);
    const questionId = nanoid(50);

    try {
      await Questions.DeleteQuestionFromStage({
        openingId,
        questionId,
        stageId,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(
        `The question ID '${questionId}' does not exist in this stage`
      );
    }
  });
  it("allows deleting a question from a stage", async () => {
    expect.assertions(2);
    const ourStage = await Stages.GetStageInfo({
      openingId,
      stageId,
    });

    const oldQuestionOrder = ourStage.data.questionOrder;

    // Delete the last item
    await Questions.DeleteQuestionFromStage({
      openingId,
      stageId,
      questionId: oldQuestionOrder.slice(-1)[0],
    });

    const updatedStage = await Stages.GetStageInfo({
      openingId,
      stageId,
    });

    const updatedQuestionOrder = updatedStage.data.questionOrder;
    expect(updatedQuestionOrder.length).toBe(oldQuestionOrder.length - 1);
    expect(updatedQuestionOrder.slice(-1)[0]).not.toBe(
      oldQuestionOrder.slice(-1)[0]
    );
  });

  it("returns all questions in a stage, in their actual question order", async () => {
    expect.assertions(2);
    const question1Id = nanoid(15);
    const question2Id = nanoid(15);
    const question3Id = nanoid(15);
    const question4Id = nanoid(15); // Will be placed second

    const allQuestionIds = [question1Id, question2Id, question3Id, question4Id];

    // Create the three questions
    await Promise.all(
      allQuestionIds.map(async (id) => {
        await Questions.CreateQuestion({
          GSI1SK: nanoid(20),
          questionId: id,
        });
      })
    );

    const allOpenings = await Openings.GetAllOpeningsInOrg();

    const ourOpening = allOpenings.data[0];

    const stageName = nanoid(20);
    await Stages.CreateStage({
      GSI1SK: stageName,
      openingId: ourOpening.openingId,
    });

    const allStages = await Stages.GetStagesInOpening(ourOpening.openingId);
    const ourStage = allStages.data.find(
      (stage: DynamoNewStage) => stage.GSI1SK === stageName
    );

    try {
      // if we try to promise.all -> .map this, we get a transaction error
      // as Dynamo tries to update the stage multiple times in quick succession
      for await (const id of [question1Id, question2Id, question3Id]) {
        await Questions.AddQuestionToStage({
          openingId: ourOpening.openingId,
          stageId: ourStage.stageId,
          questionId: id,
          position: 0, // Each question will be added as the first item
        });
      }
    } catch (error) {
      console.error(error);
    }

    await Questions.AddQuestionToStage({
      openingId: ourOpening.openingId,
      stageId: ourStage.stageId,
      questionId: question4Id,
      position: 1, // Make this one 2nd place
    });
    const updatedStage = await Stages.GetStageInfo({
      openingId: ourOpening.openingId,
      stageId: ourStage.stageId,
    });

    const properOrder = [question3Id, question4Id, question2Id, question1Id];

    const response = await Questions.GetQuestionsInStage({
      openingId: ourOpening.openingId,
      stageId: ourStage.stageId,
    });
    const questions = response.data;
    const onlyIds = questions.map(
      (question: DynamoNewQuestion) => question.questionId
    );
    expect(questions.length).toBe(4);
    expect(onlyIds).toStrictEqual(properOrder);
  });

  it.todo(
    "Async... - When deleting a question from an org, delete from all stages. Will require a transact write on stage update, and also a GSI to keep track of all staegs that have this question :>"
  );
});
