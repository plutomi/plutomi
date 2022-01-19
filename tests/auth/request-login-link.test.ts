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

  it("can pass in undefined callback url", async () => {
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
    } catch (error) {
      console.log(error);
    }
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
      console.log(error);
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain(
        "queryStringParameters.callbackUrl"
      );
      expect(error.response.data.message).toContain("must be a valid uri");
    }
  });
});
