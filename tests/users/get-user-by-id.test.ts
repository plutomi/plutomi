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

describe("Users - Others", () => {
  it("returns a user by ID", async () => {
    // Get user ID from session
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
});
