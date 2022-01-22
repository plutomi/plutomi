import axios from "../utils/axios";

// TODO types
const RequestLoginLink = async (email, callbackUrl) => {
  const { data } = await axios.post(
    `/request-login-link?callbackUrl=${callbackUrl}`,
    email
  );
  return data;
};

const Logout = async () => {
  const { data } = await axios.post(`/logout`);
  return data;
};

export { RequestLoginLink, Logout };
