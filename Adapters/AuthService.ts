import axios from "../axios/axios";

export default class AuthService {
  // TODO types
  static async login(userEmail, callbackUrl, loginMethod) {
    const body = {
      loginMethod: loginMethod,
      userEmail: userEmail,
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
