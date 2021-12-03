import axios from "../axios";
export default class AuthService {
  // TODO types
  static async login(email, callbackUrl, loginMethod) {
    const body = {
      loginMethod: loginMethod,
      email: email,
    };

    const { data } = await axios.post(
      `/auth/login?callbackUrl=${callbackUrl}`,
      body
    );
    return data;
  }

  static async logout() {
    const { data } = await axios.post(`/auth/logout`);
    return data;
  }
}
