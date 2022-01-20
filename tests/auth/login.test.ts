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
describe("Login", () => {
  it("fails with an empty login token", async () => {
    try {
      await axios.get(URL + "?token=");
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("query.token");
      expect(error.response.data.message).toContain("not allowed to be empty");
    }
  });

  it("fails without a token at all", async () => {
    try {
      await axios.get(URL + "");
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("query.token");
      expect(error.response.data.message).toContain("is required");
    }
  });

  it("fails with a bad token", async () => {
    try {
      await axios.get(URL + "?token=123");
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.message).toBe("Invalid login link");
    }
  });
});
