import axios, { AxiosResponse } from "axios";
import { API_URL } from "../../Config";
const URL = `${API_URL}/login`;

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

describe("Logout", () => {
  it("Deletes the session cookie", async () => {
    try {
      const data = await axios.post("/logout");
      const cookie = data.headers["set-cookie"][0];

      expect(cookie).toBe([]);
      expect(data.status).toBe(200);
      expect(data.data.message).toBe("You've been logged out!");
    } catch (error) {
    }
  });
});
