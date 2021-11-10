import axios from "../axios/axios";

export default class AuthService {
  static async login({ user_email, callbackUrl, loginMethod }) {
    const body = {
      loginMethod: loginMethod,
      user_email: user_email,
    };

    const { data } = await axios.post(
      `/api/auth/login?callbackUrl=${callbackUrl}`,
      body
    );
    return data;
  }

  static async logout() {
    const { data } = await axios.post(`/api/auth/logout`);
    return data;
  }
}
