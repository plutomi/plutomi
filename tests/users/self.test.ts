import axios, { AxiosResponse } from "axios";
import { API_URL, DEFAULTS, ENTITY_TYPES } from "../../Config";

/**
 * Creates a session cookie
 */
beforeAll(async () => {
  // https://stackoverflow.com/questions/49482429/axios-on-nodejs-wont-retain-session-on-requested-server-while-postman-does/56381769#56381769
  const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`);
  const cookie = data.headers["set-cookie"][0];
  console.log(cookie);
  axios.defaults.headers.Cookie = cookie;
});

describe("Users - Self", () => {
  it("returns my user information", async () => {
    const data = await axios.get(API_URL + "/users/self");
    expect(data.status).toBe(200);
    expect(data.data).toMatchObject({
      PK: expect.stringContaining(ENTITY_TYPES.USER),
      SK: ENTITY_TYPES.USER,
      userId: expect.any(String),
      createdAt: expect.any(String), // TODO there probably a better way to test ISO dates
      GSI1PK: `${ENTITY_TYPES.ORG}#${DEFAULTS.NO_ORG}#${ENTITY_TYPES.USER}S`,
      verifiedEmail: false,
      email: expect.any(String), // TODO jest email
      entityType: ENTITY_TYPES.USER,
      totalInvites: 0,
      firstName: DEFAULTS.FIRST_NAME,
      lastName: DEFAULTS.LAST_NAME,
      orgId: DEFAULTS.NO_ORG,
      orgJoinDate: DEFAULTS.NO_ORG,
      canReceiveEmails: true,
      unsubscribeKey: expect.any(String),
      GSI1SK: `${DEFAULTS.NO_FIRST_NAME} ${DEFAULTS.NO_LAST_NAME}`,
      GSI2PK: expect.any(String), // TODO jest email
      GSI2SK: ENTITY_TYPES.USER,
    });
  });
});
