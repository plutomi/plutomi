import axios from "../axios/axios";

export default class AuthService {
  static async createLoginLink({ user_email, callback_url }) {
    const body: APICreateLoginLinkInput = {
      user_email: user_email,
    };

    const { data } = await axios.post(
<<<<<<< HEAD
<<<<<<< HEAD
      `/api/auth/login?callback_url=${callback_url}`,
      body
    );
    return data;
  }

  static async logout() {
    const { data } = await axios.post(`/api/auth/logout`);
=======
      `/api/auth?callback_url=${callback_url}`,
=======
      `/api/auth/login?callback_url=${callback_url}`,
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
      body
    );
>>>>>>> 2f22d4b (Added logging in with links / cookies)
    return data;
  }

  static async logout() {
    const { data } = await axios.post(`/api/auth/logout`);
    return data;
  }
}
