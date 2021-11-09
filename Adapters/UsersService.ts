import axios from "../axios/axios";

export default class UsersService {
  static getSelfURL() {
    return `/api/users/self`;
  }
  static async getSelf() {
    const { data } = await axios.get(this.getSelfURL());
    return data;
  }

  static getSpecificUserURL({ userId }: APIGetUserURL) {
    return `/api/users/${userId}`;
  }
  static async getSpecificUser({ userId }: APIGetUserInput) {
    const { data } = await axios.get(this.getSpecificUserURL({ userId }));
    return data;
  }
  static async updateUser({ userId, new_user_values }) {
    const body = {
      new_user_values: new_user_values,
    };
    const { data } = await axios.put(this.getSpecificUserURL({ userId }), body);
    return data;
  }
}
