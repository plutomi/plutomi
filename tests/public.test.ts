import { nanoid } from 'nanoid';
import { AXIOS_INSTANCE as axios, OpeningState } from '../Config';
import * as PublicInfo from '../adapters/PublicInfo';
import * as Orgs from '../adapters/Orgs';
import * as Openings from '../adapters/Openings';
import * as Stages from '../adapters/Stages';
import { DynamoOpening } from '../types/dynamo';
import TagGenerator from '../utils/tagGenerator';

describe('Public', () => {
  /**
   * Creates a session cookie to create the necessary entities
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;
  });

  const orgId = TagGenerator({
    value: 30,
  });
  const displayName = nanoid(20);
  it('returns a 404 if org not found', async () => {
    expect.assertions(2);
    try {
      await PublicInfo.GetPublicOrgInfo(nanoid(500));
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe('Org not found');
    }
  });

  it('returns public information about an org', async () => {
    expect.assertions(4);
    // Create an org
    await Orgs.CreateOrg({
      orgId,
      displayName,
    });
    const data = await PublicInfo.GetPublicOrgInfo(orgId);

    expect(data.status).toBe(200);
    expect(Object.keys(data.data)).toStrictEqual(['orgId', 'displayName']);
    expect(data.data.orgId).toBe(orgId);
    expect(data.data.displayName).toBe(displayName);
  });

  it('returns all public openings in an org', async () => {
    expect.assertions(5);
    // Create two openings in the org
    const opening1Name = nanoid(20);
    const opening2Name = nanoid(20);

    await Openings.CreateOpening({
      openingName: opening1Name,
    });

    await Openings.CreateOpening({
      openingName: opening2Name,
    });

    const allOpenings = await Openings.GetAllOpeningsInOrg();

    expect(allOpenings.status).toBe(200);
    expect(allOpenings.data.length).toBeGreaterThanOrEqual(2);
    const opening1 = allOpenings.data.find(
      (opening: DynamoOpening) => opening.openingName === opening1Name,
    );

    // Add a stage to the opening so we can make it public
    await Stages.CreateStage({
      openingId: opening1.openingId,
      GSI1SK: nanoid(20),
    });

    // Make that opening public
    await Openings.UpdateOpening({
      openingId: opening1.openingId,
      newValues: {
        GSI1SK: OpeningState.PUBLIC,
      },
    });

    const result = await PublicInfo.GetPublicOpenings(opening1.orgId);

    expect(result.status).toBe(200);
    expect(result.data.length).toBe(1);
    expect(Object.keys(result.data[0])).toStrictEqual(['openingName', 'createdAt', 'openingId']);
  });

  it('returns 403 if opening is private', async () => {
    expect.assertions(4);
    // Create two openings in the org
    const openingName = nanoid(20);

    await Openings.CreateOpening({
      openingName,
    });

    const allOpenings = await Openings.GetAllOpeningsInOrg();

    expect(allOpenings.status).toBe(200);
    expect(allOpenings.data.length).toBeGreaterThanOrEqual(2);
    const opening1 = allOpenings.data.find(
      (opening: DynamoOpening) => opening.openingName === openingName,
    );

    try {
      await PublicInfo.GetPublicOpeningInfo({
        openingId: opening1.openingId,
        orgId,
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe('You cannot view this opening at this time');
    }
  });
  it('returns public information about an opening', async () => {
    expect.assertions(3);
    // Create an opening
    const openingName = nanoid(20);

    await Openings.CreateOpening({
      openingName,
    });

    const allOpenings = await Openings.GetAllOpeningsInOrg();

    expect(allOpenings.status).toBe(200);
    const ourOpening = allOpenings.data.find(
      (opening: DynamoOpening) => opening.openingName === openingName,
    );

    // Add a stage to the opening so we can make it public
    await Stages.CreateStage({
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(20),
    });

    // Make the opening public
    await Openings.UpdateOpening({
      openingId: ourOpening.openingId,
      newValues: {
        GSI1SK: OpeningState.PUBLIC,
      },
    });

    const result = await PublicInfo.GetPublicOpeningInfo({
      orgId: ourOpening.orgId,
      openingId: ourOpening.openingId,
    });

    expect(result.status).toBe(200);
    expect(Object.keys(result.data)).toStrictEqual(['openingName', 'createdAt', 'openingId']);
  });
});
