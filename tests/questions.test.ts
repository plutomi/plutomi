import { nanoid } from 'nanoid';
import { AXIOS_INSTANCE as axios, ERRORS } from '../Config';
import * as Openings from '../adapters/Openings';
import * as Stages from '../adapters/Stages';
import * as Questions from '../adapters/Questions';
import * as Orgs from '../adapters/Orgs';
import { DynamoQuestion, DynamoStage } from '../types/dynamo';
import TagGenerator from '../utils/tagGenerator';

describe('Questions', () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers['set-cookie'][0];

    axios.defaults.headers.Cookie = cookie;
  });

  it('blocks creating a question if not in org', async () => {
    expect.assertions(2);

    try {
      await Questions.CreateQuestion({
        GSI1SK: nanoid(1),
        questionId: TagGenerator({
          value: 20,
          joinString: '_',
        }),
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  let questionId = TagGenerator({
    value: 20,
    joinString: '_',
  });
  it('creates a question and increments the totalQuestions count on an org', async () => {
    expect.assertions(3);

    await Orgs.CreateOrg({ displayName: nanoid(20), orgId: nanoid(20) });

    // Create the question
    const data = await Questions.CreateQuestion({
      GSI1SK: nanoid(12),
      questionId,
    });
    expect(data.status).toBe(201);
    expect(data.data.message).toBe('Question created!');

    const orgData = await Orgs.GetOrgInfo();
    expect(orgData.data.totalQuestions).toBe(1);
  });

  it('blocks creating a question with the same ID', async () => {
    expect.assertions(2);
    const questionId = TagGenerator({
      value: 20,
      joinString: '_',
    });
    await Questions.CreateQuestion({
      questionId,
      GSI1SK: nanoid(20),
    });
    try {
      await Questions.CreateQuestion({
        questionId,
        GSI1SK: nanoid(20),
      });
    } catch (error) {
      expect(error.response.status).toBe(409);
      expect(error.response.data.message).toBe('A question already exists with this ID');
    }
  });

  it('blocks creating questions with an empty id', async () => {
    expect.assertions(3);

    try {
      await Questions.CreateQuestion({
        questionId: '',
        GSI1SK: nanoid(5),
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.questionId');
      expect(error.response.data.message).toContain('is not allowed to be empty');
    }
  });

  it('blocks creating questions with an empty title', async () => {
    expect.assertions(3);
    try {
      await Questions.CreateQuestion({
        questionId: TagGenerator({
          value: 20,
          joinString: '_',
        }),
        GSI1SK: '',
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.GSI1SK');
      expect(error.response.data.message).toContain('is not allowed to be empty');
    }
  });

  const newQuestionName = nanoid(20);
  it('allows updating a question', async () => {
    expect.assertions(2);
    const data = await Questions.UpdateQuestion({
      questionId,
      newValues: {
        GSI1SK: newQuestionName,
      },
    });

    expect(data.status).toBe(200);
    expect(data.data.message).toBe('Question updated!');
  });

  it("allows returning a question's info", async () => {
    expect.assertions(2);
    const data = await Questions.GetQuestionInfo(questionId);
    expect(data.status).toBe(200);
    expect(data.data.GSI1SK).toBe(newQuestionName);
  });

  it('blocks updating a question id', async () => {
    expect.assertions(3);
    try {
      await Questions.UpdateQuestion({
        questionId,
        newValues: {
          questionId: TagGenerator({
            value: 20,
            joinString: '_',
          }),
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.questionId');
      expect(error.response.data.message).toContain('is not allowed');
    }
  });

  it('allows deleting a question from an org and decrements the totalQuestions count on the org', async () => {
    expect.assertions(3);
    const orgDataBefore = await Orgs.GetOrgInfo();
    const data = await Questions.DeleteQuestionFromOrg(questionId);
    expect(data.status).toBe(200);
    expect(data.data.message).toBe('Question deleted!');

    const orgDataAfter = await Orgs.GetOrgInfo();
    expect(orgDataAfter.data.totalQuestions).toBe(orgDataBefore.data.totalQuestions - 1);
  });

  // Questions and stages
  let openingId: string;
  let stageId: string;
  questionId = TagGenerator({
    value: 20,
    joinString: '_',
  });
  it('adds a question to a stage', async () => {
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
    expect(addQuestionToStage.data.message).toBe('Question added to stage!');
  });

  it('blocks a user from adding the same question to a stage twice', async () => {
    expect.assertions(2);
    // Essentially the same thing as above, but expects an error instead
    try {
      await Questions.AddQuestionToStage({ openingId, stageId, questionId });
    } catch (error) {
      expect(error.response.status).toBe(409);
      expect(error.response.data.message).toBe(
        `A question with the ID of '${questionId}' already exists in this stage. Please use a different question ID or delete the old one.`,
      );
    }
  });

  it('allows adding a question at a specific position in a stage', async () => {
    expect.assertions(3);

    // We're going to add question 1 to the END
    // And question 2 as the first question
    const questionId1 = TagGenerator({
      value: 20,
      joinString: '_',
    });
    const questionId2 = TagGenerator({
      value: 20,
      joinString: '_',
    });

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
    ourStage.data.questionOrder.splice(0, 1, '123');
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
        "The questionIds in the 'questionOrder' property differ from the ones in the stage, please check your request and try again.",
      );
    }
  });
  it('blocks adding a question to a stage if the question does not exist', async () => {
    expect.assertions(2);
    const questionId = TagGenerator({
      value: 20,
      joinString: '_',
    });
    try {
      await Questions.AddQuestionToStage({
        openingId: nanoid(20),
        stageId: nanoid(20),
        questionId,
      });
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe(
        `A question with the ID of '${questionId}' does not exist in this org`,
      );
    }
  });

  it("returns an error if attempting to delete a question that doesn't exist in the stage", async () => {
    expect.assertions(2);
    const questionId = TagGenerator({
      value: 20,
      joinString: '_',
    });
    try {
      await Questions.DeleteQuestionFromStage({
        openingId,
        questionId,
        stageId,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(
        `The question ID '${questionId}' does not exist in this stage`,
      );
    }
  });
  it('allows removing a question from a stage', async () => {
    expect.assertions(4);
    const ourStage = await Stages.GetStageInfo({
      openingId,
      stageId,
    });

    const oldQuestionOrder = ourStage.data.questionOrder;

    // Delete the last item
    const deleteSuccess = await Questions.DeleteQuestionFromStage({
      openingId,
      stageId,
      questionId: oldQuestionOrder.slice(-1)[0],
    });
    expect(deleteSuccess.status).toBe(200);
    expect(deleteSuccess.data.message).toBe('Question removed from stage!');
    const updatedStage = await Stages.GetStageInfo({
      openingId,
      stageId,
    });

    const updatedQuestionOrder = updatedStage.data.questionOrder;
    expect(updatedQuestionOrder.length).toBe(oldQuestionOrder.length - 1);
    expect(updatedQuestionOrder.slice(-1)[0]).not.toBe(oldQuestionOrder.slice(-1)[0]);
  });

  it('returns all questions in a stage, in their actual question order', async () => {
    expect.assertions(2);
    const q1ID = TagGenerator({
      value: 20,
      joinString: '_',
    });
    const q2ID = TagGenerator({
      value: 20,
      joinString: '_',
    });
    const q3ID = TagGenerator({
      value: 20,
      joinString: '_',
    });
    const q4ID = TagGenerator({
      value: 20,
      joinString: '_',
    }); // Will be placed second

    const allQuestionIds = [q1ID, q2ID, q3ID, q4ID];

    /**
     * Create the first three questions, TODO do this in parallel
     */
    for await (const id of allQuestionIds) {
      await Questions.CreateQuestion({
        GSI1SK: nanoid(20),
        questionId: id,
      });
    }

    const allOpenings = await Openings.GetAllOpeningsInOrg();

    const ourOpening = allOpenings.data[0];

    const stageName = nanoid(20);
    await Stages.CreateStage({
      GSI1SK: stageName,
      openingId: ourOpening.openingId,
    });

    const allStages = await Stages.GetStagesInOpening(ourOpening.openingId);

    const ourStage = allStages.data.find((stage: DynamoStage) => stage.GSI1SK === stageName);

    /**
     * If we try to promise.all -> .map this, we get a transaction error
     * as Dynamo tries to update the same stage multiple times in quick succession
     */
    for await (const id of allQuestionIds.slice(0, 3)) {
      await Questions.AddQuestionToStage({
        openingId: ourOpening.openingId,
        stageId: ourStage.stageId,
        questionId: id,
        position: 0, // Each question will be added as the first item
      });
    }

    await Questions.AddQuestionToStage({
      openingId: ourOpening.openingId,
      stageId: ourStage.stageId,
      questionId: q4ID,
      position: 1, // Make this one 2nd place
    });

    const properOrder = [q3ID, q4ID, q2ID, q1ID];

    const response = await Questions.GetQuestionsInStage({
      openingId: ourOpening.openingId,
      stageId: ourStage.stageId,
    });
    const idsOnly = response.data.map((question: DynamoQuestion) => question.questionId);

    expect(response.data.length).toBe(4);
    expect(idsOnly).toStrictEqual(properOrder);
  });

  it('increments and decrements the totalStages count on a question when adding and removing it from a stage', async () => {
    expect.assertions(2);
    const questionId = TagGenerator({
      value: 20,
      joinString: '_',
    });
    await Questions.CreateQuestion({
      GSI1SK: nanoid(20),
      questionId,
    });

    // Doesn't matter which one we get
    const allOpenings = await Openings.GetAllOpeningsInOrg();
    const ourOpening = allOpenings.data[0];

    const stageName = nanoid(20);
    // Just in case there isn't one already
    await Stages.CreateStage({
      GSI1SK: stageName,
      openingId: ourOpening.openingId,
    });

    const allStages = await Stages.GetStagesInOpening(ourOpening.openingId);
    const ourStage = allStages.data.find((stage: DynamoStage) => stage.GSI1SK === stageName);

    await Questions.AddQuestionToStage({
      openingId,
      stageId: ourStage.stageId,
      questionId,
    });

    const ourQuestion = await Questions.GetQuestionInfo(questionId);
    expect(ourQuestion.data.totalStages).toBe(1);

    await Questions.DeleteQuestionFromStage({
      openingId,
      stageId: ourStage.stageId,
      questionId,
    });
    const updatedQuestion = await Questions.GetQuestionInfo(questionId);

    expect(updatedQuestion.data.totalStages).toBe(0);
  });
});
