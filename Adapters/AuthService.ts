import axios from "../axios/axios";

export default class AuthService {
  static async createLoginLink({ user_email, callback_url }) {
    const body: APICreateLoginLinkInput = {
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
