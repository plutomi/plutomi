import axios from "../utils/axios";
export default class AuthService {
  // TODO types
  // Default callbackurl is DEFAULTS.REDIRECT
  static async requestLoginLink(email, callbackUrl, loginMethod) {
    const body = {
      loginMethod,
      email,
    };

    const { data } = await axios.post(
      `/request-login-link?callbackUrl=${callbackUrl}`,
      body
    );
    return data;
  }

  static async logout() {
    const { data } = await axios.post(`/logout`);
    return data;
  }
}
