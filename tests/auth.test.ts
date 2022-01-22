import axios, { AxiosResponse } from "axios";
import { API_URL, EMAILS, ERRORS } from "../Config";
const URL = `${API_URL}/request-login-link`;

describe("Request login link", () => {
  it("blocks slightly wrong addresses", async () => {
    try {
      await axios.post(URL, {
        email: "wronggmailtypo@gmaill.com",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(ERRORS.EMAIL_VALIDATION);
    }
  });

  it("blocks known disposable emails", async () => {
    try {
      await axios.post(URL, {
        email: "test@10minutemail.com",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(ERRORS.EMAIL_VALIDATION);
    }
  });

  it("needs an actual email address", async () => {
    try {
      await axios.post(URL, {
        email: "beans.com",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.email");
      expect(error.response.data.message).toContain("must be a valid email");
    }
  });

  it("can pass in an undefined callback url", async () => {
    try {
      const { status, data } = await axios.post(URL + "?callbackUrl=", {
        email: EMAILS.TESTING,
      });

      expect(status).toBe(201);
      expect(data.message).toBe("Login link sent!");
    } catch (error) {}
  });

  it("blocks an invalid callbackUrl", async () => {
    try {
      await axios.post(URL + "?callbackUrl=http:mongo.", {
        email: EMAILS.TESTING,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("query.callbackUrl");
      expect(error.response.data.message).toContain("must be a valid uri");
    }
  });

  it("blocks frequent requests from non-admins", async () => {
    try {
      await axios.post(URL, {
        email: "plutomitesting@gmail.com",
      });
      //
      await axios.post(URL, {
        email: "plutomitesting@gmail.com",
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        "You're doing that too much, please try again later"
      );
    }
  });

  it("allows admins to skip the request timer", async () => {
    try {
      const data = await axios.post(URL, {
        email: EMAILS.TESTING,
      });

      expect(data.status).toBe(201);
      expect(data.data.message).toBe("Login link sent!");

      const data2 = await axios.post(URL, {
        email: EMAILS.TESTING,
      });

      expect(data2.status).toBe(201);
      expect(data2.data.message).toBe("Login link sent!");
    } catch (error) {}
  });
});

describe("Login", () => {
  it("fails with an empty login token", async () => {
    try {
      await axios.get(API_URL + "/login?token=");
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("query.token");
      expect(error.response.data.message).toContain("not allowed to be empty");
    }
  });

  it("fails without a token", async () => {
    try {
      await axios.get(API_URL + "/login");
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("query.token");
      expect(error.response.data.message).toContain("is required");
    }
  });

  it("fails with a bad token", async () => {
    try {
      await axios.get(API_URL + "/login?token=123");
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.message).toBe("Invalid login link");
    }
  });
});

describe("Logout", () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`);
    const cookie = data.headers["set-cookie"][0];

    axios.defaults.headers.Cookie = cookie;
  });

  it("Deletes the session cookie", async () => {
    try {
      const data = await axios.post("/logout");
      const cookie = data.headers["set-cookie"][0];

      expect(cookie).toBe([]);
      expect(data.status).toBe(200);
      expect(data.data.message).toBe("You've been logged out!");
    } catch (error) {}
  });
});
