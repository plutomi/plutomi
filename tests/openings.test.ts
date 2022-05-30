import { nanoid } from 'nanoid';
import { AXIOS_INSTANCE as axios, ERRORS, OpeningState } from '../Config';
import * as Openings from '../adapters/Openings';
import * as Orgs from '../adapters/Orgs';
import * as Stages from '../adapters/Stages';
import { DynamoOpening } from '../types/dynamo';

describe('Openings', () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;
  });

  it('fails to create an opening if a user is not in an org', async () => {
    expect.assertions(2);
    try {
      await Openings.CreateOpening({
        openingName: '1',
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it('fails to retrieve openings in an org if a user does not have an org', async () => {
    expect.assertions(2);
    try {
      await Openings.GetAllOpeningsInOrg();
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it('fails to retrieve a specific opening if a user does not have an org', async () => {
    expect.assertions(2);
    try {
      await Openings.GetOpeningInfo('123');
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it('fails to create an opening with a large name', async () => {
    expect.assertions(3);
    // Create an org
    await Orgs.CreateOrg({
      displayName: nanoid(20),
      orgId: nanoid(20),
    });

    try {
      await Openings.CreateOpening({
        openingName: nanoid(2000),
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.openingName');
      expect(error.response.data.message).toContain('less than or equal to 100');
    }
  });

  it('creates an opening', async () => {
    expect.assertions(2);
    const data = await Openings.CreateOpening({
      openingName: nanoid(20),
    });

    expect(data.status).toBe(201);
    expect(data.data.message).toBe('Opening created!');
  });

  it('allows retrieving openings in an org', async () => {
    expect.assertions(2);
    // Create an opening first
    await Openings.CreateOpening({
      openingName: nanoid(20),
    });

    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();
    expect(data.status).toBe(200);
    expect(data.data.length).toBeGreaterThanOrEqual(1);
  });

  it('returns a 404 if an opening does not exist', async () => {
    expect.assertions(2);
    try {
      await Openings.GetOpeningInfo('1');
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe('Opening not found');
    }
  });

  it('allows retrieving an opening by id', async () => {
    expect.assertions(2);
    // Create an opening first
    await Openings.CreateOpening({
      openingName: nanoid(10),
    });

    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    // Get the first opening
    const opening = data.data[0];

    // Test getting an opening by id
    const data2 = await Openings.GetOpeningInfo(opening.openingId);
    expect(data2.status).toBe(200);
    expect(data2.data).toStrictEqual(opening);
  });

  it('allows updating an opening', async () => {
    expect.assertions(2);
    // Create an opening
    await Openings.CreateOpening({
      openingName: nanoid(10),
    });

    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    // Get the first opening
    const opening = data.data[0];

    const newName = nanoid(20);
    // Update the opening
    const data2 = await Openings.UpdateOpening({
      openingId: opening.openingId,
      newValues: {
        openingName: newName,
      },
    });

    expect(data2.status).toBe(200);
    expect(data2.data.message).toBe('Opening updated!');
  });

  it('fails to make an opening public if there are no stages in it', async () => {
    expect.assertions(2);
    const openingName = nanoid(20);

    // Create the opening
    await Openings.CreateOpening({
      openingName,
    });
    const allOpenings = await Openings.GetAllOpeningsInOrg();

    const ourOpening = allOpenings.data.find(
      (opening: DynamoOpening) => opening.openingName === openingName,
    );

    // Try to update
    try {
      await Openings.UpdateOpening({
        openingId: ourOpening.openingId,
        newValues: {
          GSI1SK: OpeningState.PUBLIC,
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        'An opening needs to have stages before being made public',
      );
    }
  });

  it('blocks updating an opening with an extra long name', async () => {
    expect.assertions(3);
    // Create an opening
    await Openings.CreateOpening({
      openingName: nanoid(10),
    });
    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    // Get the first opening
    const opening = data.data[0];

    // Update the opening
    try {
      await Openings.UpdateOpening({
        openingId: opening.openingId,
        newValues: {
          openingName: nanoid(500),
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.openingName');
      expect(error.response.data.message).toContain('less than or equal to 100');
    }
  });

  it('blocks editing forbidden properties of an opening', async () => {
    expect.assertions(2);
    // Create an opening
    await Openings.CreateOpening({
      openingName: nanoid(10),
    });
    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    // Get the first opening
    const opening = data.data[0];

    try {
      await Openings.UpdateOpening({
        openingId: opening.openingId,
        newValues: {
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

  it('allows deleting openings', async () => {
    expect.assertions(2);
    // Create an opening
    await Openings.CreateOpening({
      openingName: nanoid(10),
    });
    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    // Get the first opening
    const opening = data.data[0];

    const data2 = await Openings.DeleteOpening(opening.openingId);
    expect(data2.status).toBe(200);
    expect(data2.data.message).toBe('Opening deleted!');
  });

  it('allows updating stage order', async () => {
    expect.assertions(4);
    const ourOpeningName = nanoid(15);

    // Create an opening
    await Openings.CreateOpening({
      openingName: ourOpeningName,
    });
    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    // Get our opening
    const ourOpening = data.data.find(
      (opening: DynamoOpening) => opening.openingName === ourOpeningName,
    );

    expect(ourOpening.stageOrder.length).toBe(0);

    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(20),
    });
    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(20),
    });

    const updatedOpening = await Openings.GetOpeningInfo(ourOpening.openingId);

    expect(updatedOpening.data.stageOrder.length).toBe(2);

    // Update with new stage order
    const withNewOrder = await Openings.UpdateOpening({
      openingId: ourOpening.openingId,
      newValues: {
        stageOrder: updatedOpening.data.stageOrder.reverse(),
      },
    });

    expect(withNewOrder.status).toBe(200);
    expect(withNewOrder.data.message).toBe('Opening updated!');
  });
  it('blocks removing / adding stages in the stageOrder on the opening', async () => {
    expect.assertions(4);
    const ourOpeningName = nanoid(15);

    await Openings.CreateOpening({
      openingName: ourOpeningName,
    });

    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    // Get our opening
    const ourOpening = data.data.find(
      (opening: DynamoOpening) => opening.openingName === ourOpeningName,
    );

    expect(ourOpening.stageOrder.length).toBe(0);
    // Add a stage to our opening

    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(20),
    });

    const updatedOpening = await Openings.GetOpeningInfo(ourOpening.openingId);

    expect(updatedOpening.data.stageOrder.length).toBe(1);

    // Try adding a fake stage
    const withExtraStage = [...updatedOpening.data.stageOrder, nanoid(10)];

    try {
      await Openings.UpdateOpening({
        openingId: ourOpening.openingId,
        newValues: {
          stageOrder: withExtraStage,
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        'You cannot add / delete stages this way, please use the proper API methods for those actions',
      );
    }
  });

  it("blocks updating the stage order with ID's that do not exist", async () => {
    expect.assertions(4);
    const ourOpeningName = nanoid(15);

    await Openings.CreateOpening({
      openingName: ourOpeningName,
    });

    // Get openings in an org
    const data = await Openings.GetAllOpeningsInOrg();

    // Get our opening
    let ourOpening = data.data.find(
      (opening: DynamoOpening) => opening.openingName === ourOpeningName,
    );

    expect(ourOpening.stageOrder.length).toBe(0);

    // Add a few stages  to our opening
    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(20),
    });
    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(20),
    });
    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(20),
    });

    const updatedOpeningData = await Openings.GetOpeningInfo(ourOpening.openingId);
    ourOpening = updatedOpeningData.data;

    expect(ourOpening.stageOrder.length).toBe(3);

    // Try to update the stage order with stage IDs that don't exist
    ourOpening.stageOrder.splice(0, 1, '123');
    try {
      await Openings.UpdateOpening({
        openingId: ourOpening.openingId,
        newValues: {
          stageOrder: ourOpening.stageOrder,
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(
        "The stageIds in the 'stageOrder' property differ from the ones in the opening, please check your request and try again.",
      );
    }
  });
});
