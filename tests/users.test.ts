import { nanoid } from 'nanoid';
import { AXIOS_INSTANCE as axios, DEFAULTS, Entities, ERRORS } from '../Config';
import * as Users from '../adapters/Users';

describe('Users', () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;
  });

  it('returns my user information with the cookie info', async () => {
    expect.assertions(2);
    const data = await Users.GetSelfInfo();
    expect(data.status).toBe(200);
    expect(data.data).toMatchObject({
      PK: expect.stringContaining(Entities.USER),
      SK: Entities.USER,
      userId: expect.any(String),
      createdAt: expect.any(String), // TODO there probably a better way to test ISO dates
      GSI1PK: `${Entities.ORG}#${DEFAULTS.NO_ORG}#${Entities.USER}S`,
      verifiedEmail: false,
      email: expect.any(String),
      entityType: Entities.USER,
      totalInvites: 0,
      firstName: DEFAULTS.FIRST_NAME,
      lastName: DEFAULTS.LAST_NAME,
      orgId: DEFAULTS.NO_ORG,
      orgJoinDate: DEFAULTS.NO_ORG,
      canReceiveEmails: true,
      unsubscribeKey: expect.any(String),
      GSI1SK: `${DEFAULTS.FIRST_NAME} ${DEFAULTS.LAST_NAME}`,
      GSI2PK: expect.any(String),
      GSI2SK: Entities.USER,
    });
  });

  it('returns a user by ID', async () => {
    expect.assertions(2);
    const setup = await Users.GetSelfInfo();
    const { userId } = setup.data;
    const data = await Users.GetUserInfo(userId);

    expect(data.status).toBe(200);
    expect(data.data).toMatchObject(setup.data);
  });

  it('blocks a user from viewing other users', async () => {
    expect.assertions(2);
    try {
      await Users.GetUserInfo('123');
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe('You are not authorized to view this user');
    }
  });

  it('allows updating yourself', async () => {
    expect.assertions(2);
    // Get user ID from session
    const setup = await Users.GetSelfInfo();
    const { userId } = setup.data;

    const data = await Users.UpdateUser({
      userId,
      newValues: {
        firstName: nanoid(10),
      },
    });

    expect(data.status).toBe(200);
    expect(data.data.message).toBe('Info updated!');
  });
  it('blocks updating another user', async () => {
    expect.assertions(2);
    try {
      await Users.UpdateUser({
        userId: '123',
        newValues: {
          firstName: nanoid(10),
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe('You cannot update this user');
    }
  });

  it('blocks updating forbidden properties', async () => {
    expect.assertions(2);
    try {
      await Users.UpdateUser({
        userId: '123',
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

  it('blocks users without an org from viewing users', async () => {
    expect.assertions(2);
    try {
      await Users.GetUsersInOrg();
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });
});
