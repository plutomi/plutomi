import axios, { AxiosResponse } from "axios";
import { nanoid } from "nanoid";
import { API_URL, DEFAULTS, ENTITY_TYPES, ERRORS } from "../Config";

describe("Users", () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`);
    const cookie = data.headers["set-cookie"][0];

    axios.defaults.headers.Cookie = cookie;
  });

  it("returns my user information with the cookie info", async () => {
    const data = await axios.get(API_URL + "/users/self");
    expect(data.status).toBe(200);
    expect(data.data).toMatchObject({
      PK: expect.stringContaining(ENTITY_TYPES.USER),
      SK: ENTITY_TYPES.USER,
      userId: expect.any(String),
      createdAt: expect.any(String), // TODO there probably a better way to test ISO dates
      GSI1PK: `${ENTITY_TYPES.ORG}#${DEFAULTS.NO_ORG}#${ENTITY_TYPES.USER}S`,
      verifiedEmail: false,
      email: expect.any(String),
      entityType: ENTITY_TYPES.USER,
      totalInvites: 0,
      firstName: DEFAULTS.FIRST_NAME,
      lastName: DEFAULTS.LAST_NAME,
      orgId: DEFAULTS.NO_ORG,
      orgJoinDate: DEFAULTS.NO_ORG,
      canReceiveEmails: true,
      unsubscribeKey: expect.any(String),
      GSI1SK: `${DEFAULTS.NO_FIRST_NAME} ${DEFAULTS.NO_LAST_NAME}`,
      GSI2PK: expect.any(String),
      GSI2SK: ENTITY_TYPES.USER,
    });
  });

  it("returns a user by ID", async () => {
    const setup = await axios.get(API_URL + "/users/self");
    const { userId } = setup.data;
    const data = await axios.get(API_URL + `/users/${userId}`);

    expect(data.status).toBe(200);
    expect(data.data).toMatchObject(setup.data);
  });

  it("blocks a user from viewing other users", async () => {
    try {
      await axios.get(API_URL + `/users/123`);
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        "You are not authorized to view this user"
      );
    }
  });

  it("Allows updating yourself", async () => {
    // Get user ID from session
    const setup = await axios.get(API_URL + "/users/self");
    const userId = setup.data.userId;

    try {
      await axios.put(API_URL + `/users/${userId}`, {
        newValues: {
          GSI1SK: nanoid(10),
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe("You cannot update this user");
    }
  });
  it("blocks updating another user", async () => {
    try {
      await axios.put(API_URL + `/users/123`, {
        newValues: {
          firstName: nanoid(10),
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe("You cannot update this user");
    }
  });

  it("blocks updating forbidden properties", async () => {
    try {
      await axios.put(API_URL + `/users/123`, {
        newValues: {
          orgId: nanoid(5),
          PK: nanoid(5),
          SK: nanoid(5),
          createdAt: nanoid(5),
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("is not allowed");
    }
  });

  it("blocks users without an org from viewing users", async () => {
    try {
      await axios.get(API_URL + "/users");
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });
});
