import axios from "axios";
import { API_URL } from "../../Config";

const URL = `${API_URL}/login`;
describe("Login", () => {
  it("fails with an empty login seal", async () => {
    try {
      await axios.get(URL + "?seal=");
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("query.seal");
      expect(error.response.data.message).toContain("not allowed to be empty");
    }
  });

  it("fails without a seal at all", async () => {
    try {
      await axios.get(URL + "");
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("query.seal");
      expect(error.response.data.message).toContain("is required");
    }
  });

  it("fails with a bad seal", async () => {
    try {
      await axios.get(URL + "?seal=123");
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.message).toContain("link");
      expect(error.response.data.message).toContain("is invalid");
    }
  });
});
