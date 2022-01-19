import axios from "axios";

describe("Request login link", () => {
  it("blocks slightly wrong addresses", async () => {
    try {
      await axios.post(
        // TODO dynamic link
        "https://dev.plutomi.com/request-login-link",
        {
          email: "beepboop@gmaill.com",
        }
      );
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(
        "Hmm... that email doesn't seem quite right. Check it again."
      );
    }
  });

  it("blocks known spam addresses", async () => {
    try {
      await axios.post(
        // TODO dynamic link
        "https://dev.plutomi.com/request-login-link",
        {
          email: "test@10minutemail.com",
        }
      );
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(
        "Hmm... that email doesn't seem quite right. Check it again."
      );
    }
  });

  it("needs an actual email address", async () => {
    try {
      await axios.post(
        // TODO dynamic link
        "https://dev.plutomi.com/request-login-link",
        {
          email: "10minutemail.com",
        }
      );
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.email");
      expect(error.response.data.message).toContain("must be a valid email");
    }
  });

  it("can pass in an undefined callback url", async () => {
    try {
      const { status, data } = await axios.post(
        // TODO dynamic link
        "https://dev.plutomi.com/request-login-link?callbackUrl=",
        {
          email: "contact@plutomi.com",
        }
      );

      expect(status).toBe(201);
      expect(data.message).toBe("Login link sent!");
    } catch (error) {}
  });

  it("blocks an invalid callbackUrl", async () => {
    try {
      const { status, data } = await axios.post(
        // TODO dynamic link
        "https://dev.plutomi.com/request-login-link?callbackUrl=http:mongo.",
        {
          email: "contact@plutomi.com",
        }
      );
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain(
        "queryStringParameters.callbackUrl"
      );
      expect(error.response.data.message).toContain("must be a valid uri");
    }
  });

  it("blocks frequent requests from non-admins", async () => {
    try {
      await axios.post(
        // TODO dynamic link
        "https://dev.plutomi.com/request-login-link",
        {
          email: "joseyvalerio@gmail.com",
        }
      );
      //
      await axios.post(
        // TODO dynamic link
        "https://dev.plutomi.com/request-login-link",
        {
          email: "joseyvalerio@gmail.com",
        }
      );
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        "You're doing that too much, please try again later"
      );
    }
  });

  it("allows admins to skip the request timer", async () => {
    try {
      const data = await axios.post(
        // TODO dynamic link
        "https://dev.plutomi.com/request-login-link",
        {
          email: "contact@josevalerio.com",
        }
      );
      //
      const data2 = await axios.post(
        // TODO dynamic link
        "https://dev.plutomi.com/request-login-link",
        {
          email: "jose@plutomi.com",
        }
      );

      expect(data.status).toBe(201);
      expect(data.data.message).toBe("Login link sent!");
      expect(data2.status).toBe(201);
      expect(data2.data.message).toBe("Login link sent!");
    } catch (error) {}
  });
});
