import axios from "../axios/axios";

export default class AuthService {
  static async login({ user_email, callback_url, login_method }) {
    const body = {
      login_method: login_method,
      user_email: user_email,
    };

    const { data } = await axios.post(
      `/api/auth/login?callback_url=${callback_url}`,
      body
    );
    return data;
  }

  static async logout() {
    const { data } = await axios.post(`/api/auth/logout`);
    return data;
  }
}
