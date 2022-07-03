import { Emails, ERRORS, AXIOS_INSTANCE as axios, COOKIE_NAME } from '../Config';
import * as Auth from '../adapters/Auth';

describe('Request login link', () => {
  it('blocks slightly wrong addresses', async () => {
    expect.assertions(2);
    try {
      await Auth.RequestLoginLink({
        email: 'wronggmailtypo@gmaill.com',
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(ERRORS.EMAIL_VALIDATION);
    }
  });

  it('blocks known disposable emails', async () => {
    expect.assertions(2);
    try {
      await Auth.RequestLoginLink({
        email: 'test@10minutemail.com',
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(ERRORS.EMAIL_VALIDATION);
    }
  });

  it('needs an actual email address', async () => {
    expect.assertions(3);
    try {
      await Auth.RequestLoginLink({
        email: 'beans.com',
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.email');
      expect(error.response.data.message).toContain('must be a valid email');
    }
  });

  it('can pass in an undefined callback url', async () => {
    expect.assertions(2);
    const data = await Auth.RequestLoginLink({
      email: Emails.TESTING,
      callbackUrl: undefined,
    });

    expect(data.status).toBe(201);
    expect(data.data.message).toBe("We've sent a magic login link to your email!");
  });

  it('blocks an invalid callbackUrl', async () => {
    expect.assertions(3);
    try {
      await Auth.RequestLoginLink({
        email: Emails.TESTING,
        callbackUrl: 'http:mongo.',
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('query.callbackUrl');
      expect(error.response.data.message).toContain('must be a valid uri');
    }
  });

  it('blocks frequent requests from non-admins', async () => {
    expect.assertions(2);
    try {
      await Auth.RequestLoginLink({
        email: 'plutomitesting@gmail.com',
      });
      await Auth.RequestLoginLink({
        email: 'plutomitesting@gmail.com',
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        "You're doing that too much, please try again later",
      );
    }
  });

  it('allows admins to skip the request timer', async () => {
    expect.assertions(4);

    const data = await Auth.RequestLoginLink({
      email: Emails.TESTING,
    });
    expect(data.status).toBe(201);
    expect(data.data.message).toBe("We've sent a magic login link to your email!");
    // Try it again
    const data2 = await Auth.RequestLoginLink({
      email: Emails.TESTING,
    });

    expect(data2.status).toBe(201);
    expect(data2.data.message).toBe("We've sent a magic login link to your email!");
  });
});

describe('Login', () => {
  it('fails without a token', async () => {
    expect.assertions(3);
    try {
      await Auth.Login('');
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('query.token');
      expect(error.response.data.message).toContain('not allowed to be empty');
    }
  });

  it('fails with a bad token', async () => {
    expect.assertions(2);
    try {
      await Auth.Login('123');
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.message).toBe('Invalid login link');
    }
  });
});

describe('Logout', () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;
  });

  it('Deletes the session cookie', async () => {
    expect.assertions(3);
    const data = await Auth.Logout();
    const cookies = data.headers['set-cookie'];
    /**
     * Make sure a set-cookie header is returned with an empty cookie and a negative expiry
     * In the future, the session data will be stored in Dynamo so this won't matter
     */
    expect(Array.isArray(cookies)).toBe(true);
    expect(
      // If any set-cookie header matches
      cookies.some((value: string) => value.startsWith(`${COOKIE_NAME}=; Max-Age=-1;`)),
    ).toBe(true);
    expect(data.status).toBe(200);
  });
});
