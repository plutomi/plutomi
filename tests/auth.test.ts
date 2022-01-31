import { API_URL, EMAILS, ERRORS, AXIOS_INSTANCE as axios } from "../Config";
import * as Auth from "../adapters/Auth";
const URL = `${API_URL}/request-login-link`;

describe("Request login link", () => {
  it("blocks slightly wrong addresses", async () => {
    expect.assertions(2);
    try {
      await Auth.RequestLoginLink({
        email: "wronggmailtypo@gmaill.com",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(ERRORS.EMAIL_VALIDATION);
    }
  });

  it("blocks known disposable emails", async () => {
    expect.assertions(2);
    try {
      await Auth.RequestLoginLink({
        email: "test@10minutemail.com",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(ERRORS.EMAIL_VALIDATION);
    }
  });

  it("needs an actual email address", async () => {
    expect.assertions(3);
    try {
      await Auth.RequestLoginLink({
        email: "beans.com",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.email");
      expect(error.response.data.message).toContain("must be a valid email");
    }
  });

  it("can pass in an undefined callback url", async () => {
    expect.assertions(2);
    const data = await Auth.RequestLoginLink({
      email: EMAILS.TESTING,
      callbackUrl: undefined,
    });

    expect(data.status).toBe(201);
    expect(data.data.message).toBe("Login link sent!");
  });

  it("blocks an invalid callbackUrl", async () => {
    expect.assertions(3);
    try {
      await Auth.RequestLoginLink({
        email: EMAILS.TESTING,
        callbackUrl: "http:mongo.",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("query.callbackUrl");
      expect(error.response.data.message).toContain("must be a valid uri");
    }
  });

  it("blocks frequent requests from non-admins", async () => {
    expect.assertions(2);
    try {
      await Auth.RequestLoginLink({
        email: "plutomitesting@gmail.com",
      });
      await Auth.RequestLoginLink({
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
    expect.assertions(4);

    const data = await Auth.RequestLoginLink({
      email: EMAILS.TESTING,
    });
    expect(data.status).toBe(201);
    expect(data.data.message).toBe("Login link sent!");

    // Try it again
    const data2 = await axios.post(URL, {
      email: EMAILS.TESTING,
    });

    expect(data2.status).toBe(201);
    expect(data2.data.message).toBe("Login link sent!");
  });
});

describe("Login", () => {
  it("fails with an empty login token", async () => {
    expect.assertions(3);
    try {
      await Auth.Login("");
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("query.token");
      expect(error.response.data.message).toContain("not allowed to be empty");
    }
  });

  it("fails without a token", async () => {
    expect.assertions(3);
    try {
      await axios.get("/login");
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("query.token");
      expect(error.response.data.message).toContain("is required");
    }
  });

  it("fails with a bad token", async () => {
    expect.assertions(2);
    try {
      await Auth.Login("123");
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
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie;
  });

  it("Deletes the session cookie", async () => {
    expect.assertions(2);
    const data = await Auth.Logout();
    const cookie = data.headers["set-cookie"][0];
    expect(cookie).toBe([]);
    expect(data.status).toBe(200);
  });
});
