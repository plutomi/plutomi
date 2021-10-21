import axios from "../axios/axios";

export default class AuthService {
  static async createLoginLink({ user_email, callback_url }) {
    const body: APICreateLoginLinkInput = {
      user_email: user_email,
      callback_url: callback_url,
    };

    const { data } = await axios.post("/api/auth/login-link", body);
    return data;
  }
}
