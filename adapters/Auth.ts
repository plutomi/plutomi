import { AXIOS_INSTANCE as axios } from "../Config";

// TODO types
interface RequestLoginLinkInput {
  /**
   * The email to send the login link to
   */
  email: string;
  /**
   * The URL to redirect back to
   */
  callbackUrl?: string;
}
const RequestLoginLink = async (options: RequestLoginLinkInput) => {
  const { email, callbackUrl } = options;
  const data = await axios.post(
    `/request-login-link?callbackUrl=${callbackUrl}`,
    { email }
  );
  return data;
};

const Logout = async () => {
  const data = await axios.post(`/logout`);
  return data;
};

const Login = async (token: string) => {
  const data = await axios.get(`/login?token=${token}`);
  return data;
};

export { RequestLoginLink, Logout, Login };
