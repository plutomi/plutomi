import { AXIOS_INSTANCE as axios } from '../Config';

// TODO types
interface RequestLoginLinkInput {
  email: string;
  callbackUrl?: string;
}
const RequestLoginLink = async (options: RequestLoginLinkInput) => {
  const { email, callbackUrl } = options;

  let URL = `/request-login-link`;
  if (callbackUrl) {
    URL += `?callbackUrl=${callbackUrl}`;
  }
  const data = await axios.post(URL, { email });
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
