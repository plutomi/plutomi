import { nanoid } from 'nanoid';
import { ERRORS, AXIOS_INSTANCE as axios, LIMITS } from '../Config';
import * as Stages from '../adapters/Stages';
import * as Orgs from '../adapters/Orgs';
import * as Openings from '../adapters/Openings';

describe('Stages', () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;
  });

  it('blocks creating stages if not in an org', async () => {
    expect.assertions(2);
    try {
      await Stages.CreateStage({
        GSI1SK: nanoid(1),
        openingId: nanoid(1),
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it('blocks retrieving stages for an opening if not in an org', async () => {
    expect.assertions(2);
    try {
      await Stages.GetStagesInOpening('123');
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it('blocks deletion of stages if user is not in an org', async () => {
    expect.assertions(2);
    try {
      await Stages.DeleteStage({
        openingId: nanoid(3),
        stageId: nanoid(3),
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it('blocks updating a stage if user is not in an org', async () => {
    expect.assertions(2);
    try {
      await Stages.UpdateStage({
        openingId: nanoid(3),
        stageId: nanoid(3),
        newValues: {
          GSI1SK: nanoid(1),
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it('blocks retrieving stage info if user is not in an org', async () => {
    expect.assertions(2);
    try {
      await Stages.GetStageInfo({
        openingId: '123',
        stageId: '123',
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it('fails to create a stage without an empty empty values for openingId and stage name', async () => {
    expect.assertions(4);
    // Create an org
    await Orgs.CreateOrg({
      orgId: nanoid(20),
      displayName: nanoid(20),
    });

    try {
      await Stages.CreateStage({
        openingId: '',
        GSI1SK: undefined,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.openingId');
      expect(error.response.data.message).toContain('is not allowed to be empty');
      expect(error.response.data.message).toContain('must be a string');
    }
  });
  it('fails to create a stage with a position equal to MAX_CHILD_ITEM_LIMIT', async () => {
    expect.assertions(3);
    try {
      await Stages.CreateStage({
        openingId: nanoid(10),
        GSI1SK: nanoid(10),
        position: LIMITS.MAX_CHILD_ITEM_LIMIT,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.position');
      expect(error.response.data.message).toContain(
        `must be less than or equal to ${LIMITS.MAX_CHILD_ITEM_LIMIT - 1}`,
      );
    }
  });

  it('fails to create a stage with a position greater than MAX_CHILD_ITEM_LIMIT', async () => {
    expect.assertions(3);
    try {
      await Stages.CreateStage({
        openingId: nanoid(10),
        GSI1SK: nanoid(10),
        position: 500000,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.position');
      expect(error.response.data.message).toContain(
        `must be less than or equal to ${LIMITS.MAX_CHILD_ITEM_LIMIT - 1}`,
      );
    }
  });

  it('fails to create a stage in an opening that does not exist', async () => {
    expect.assertions(2);
    try {
      await Stages.CreateStage({
        openingId: '1',
        GSI1SK: nanoid(10),
        position: 2,
      });
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe('Opening does not exist');
    }
  });

  it('creates a stage without a position', async () => {
    expect.assertions(1);
    const openingName = nanoid(50);
    // Create an opening first
    await Openings.CreateOpening({
      openingName,
    });

    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    const ourOpening = data.data.find((opening) => opening.openingName === openingName);

    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(10),
    });

    // Check if our newly added stage is there
    const ourOpening2 = await Openings.GetOpeningInfo(ourOpening.openingId);
    expect(ourOpening2.data.stageOrder.length).toBe(1);
  });

  it('allows deletion of stages', async () => {
    expect.assertions(4);
    const openingName = nanoid(20);
    // Create an opening first
    await Openings.CreateOpening({
      openingName,
    });

    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    const ourOpening = data.data.find((opening) => opening.openingName === openingName);

    // Create a stage
    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(10),
    });

    const openingWithStage = await Openings.GetOpeningInfo(ourOpening.openingId);

    const deleteStageRes = await Stages.DeleteStage({
      openingId: openingWithStage.data.openingId,
      stageId: openingWithStage.data.stageOrder[0],
    });

    expect(deleteStageRes.status).toBe(200);
    expect(deleteStageRes.data.message).toBe('Stage deleted!');

    const afterdeletion = await Openings.GetOpeningInfo(ourOpening.openingId);

    expect(afterdeletion.status).toBe(200);
    expect(afterdeletion.data.stageOrder).toStrictEqual([]);
  });

  it('returns 404 if stage is not found while retrieving info', async () => {
    expect.assertions(2);
    const openingName = nanoid(20);
    // Create an opening first
    await Openings.CreateOpening({
      openingName,
    });

    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    const ourOpening = data.data.find((opening) => opening.openingName === openingName);

    try {
      await Stages.GetStageInfo({
        openingId: ourOpening.openingId,
        stageId: '1',
      });
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe('Stage not found');
    }
  });

  it('retrieves stage info', async () => {
    expect.assertions(2);
    // Create an opening
    const openingName = nanoid(20);
    await Openings.CreateOpening({
      openingName,
    });

    // Get openings in org
    const data = await Openings.GetAllOpeningsInOrg();

    const ourOpening = data.data.find((opening) => opening.openingName === openingName);

    // Create a stage
    const stageName = nanoid(10);

    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: stageName,
    });

    const updatedOpening = await Openings.GetOpeningInfo(ourOpening.openingId);

    const stage = await Stages.GetStageInfo({
      openingId: ourOpening.openingId,
      stageId: updatedOpening.data.stageOrder[0],
    });

    expect(stage.status).toBe(200);
    expect(stage.data.GSI1SK).toBe(stageName);
  });

  it('returns stages in an opening', async () => {
    expect.assertions(4);
    const openingName = nanoid(20);
    // Create an opening first
    await Openings.CreateOpening({
      openingName,
    });

    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    const ourOpening = data.data.find((opening) => opening.openingName === openingName);

    const stage1Name = nanoid(10);
    const stage2Name = nanoid(10);

    // Create the two stages
    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: stage1Name,
    });
    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: stage2Name,
    });

    const data2 = await Stages.GetStagesInOpening(ourOpening.openingId);

    expect(data2.status).toBe(200);
    expect(data2.data.length).toBe(2);

    const firstStage = data2.data[0];
    const secondStage = data2.data[1];
    expect(firstStage.GSI1SK).toBe(stage1Name);
    expect(secondStage.GSI1SK).toBe(stage2Name);
  });

  it('blocks updating forbidden properties of a stage', async () => {
    expect.assertions(2);
    const openingName = nanoid(20);

    // Create an opening
    await Openings.CreateOpening({
      openingName,
    });

    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    const ourOpening = data.data.find((opening) => opening.openingName === openingName);

    const stageName = nanoid(10);
    // Add a stage

    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: stageName,
    });

    const openingAfterStage = await Openings.GetOpeningInfo(ourOpening.openingId);

    const stageId = openingAfterStage.data.stageOrder[0];

    try {
      await Stages.UpdateStage({
        stageId,
        openingId: ourOpening.openingId,
        newValues: {
          // @ts-ignore - intentional, this will error
          orgId: nanoid(5),
          PK: nanoid(5),
          SK: nanoid(5),
          createdAt: nanoid(5),
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('is not allowed');
    }
  });

  it('allows updating a stage', async () => {
    expect.assertions(3);
    const openingName = nanoid(20);

    // Create an opening
    await Openings.CreateOpening({
      openingName,
    });

    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    const ourOpening = data.data.find((opening) => opening.openingName === openingName);

    const stageName = nanoid(10);
    // Add a stage
    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: stageName,
    });

    const openingAfterStage = await Openings.GetOpeningInfo(ourOpening.openingId);

    const stageId = openingAfterStage.data.stageOrder[0];

    const newName = nanoid(20);

    const update = await Stages.UpdateStage({
      openingId: ourOpening.openingId,
      stageId,
      newValues: {
        GSI1SK: newName,
      },
    });

    expect(update.status).toBe(200);
    expect(update.data.message).toBe('Stage updated!');

    const stageAfter = await Stages.GetStageInfo({
      openingId: ourOpening.openingId,
      stageId,
    });

    expect(stageAfter.data.GSI1SK).toBe(newName);
  });
});
