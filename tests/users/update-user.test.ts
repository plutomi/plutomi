import axios, { AxiosResponse } from "axios";
import { nanoid } from "nanoid";
import {
  API_URL,
  DEFAULTS,
  ENTITY_TYPES,
  JOI_GLOBAL_FORBIDDEN,
} from "../../Config";
import JOI_FORBIDDEN_USER from "../../Controllers/Users/update-user";
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
  it("Allows updating yourself", async () => {
    // Get user ID from session
    const setup = await axios.get(API_URL + "/users/self");
    const userId = setup.data.userId;

    try {
      await axios.put(API_URL + `/users/${userId}`, {
        newValues: {
          GSI1SK: "Test newsss",
        },
      });
    } catch (error) {
      console.log(error.response.data);
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe("You cannot update this user");
    }
  });
  it("blocks updating another user", async () => {
    try {
      await axios.put(API_URL + `/users/123`, {
        newValues: {
          firstName: "Test new name",
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
});
