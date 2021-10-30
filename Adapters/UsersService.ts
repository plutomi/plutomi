import axios from "../axios/axios";

export default class UsersService {
  static getSelfURL() {
    return `/api/users/self`;
  }
  static async getSelf() {
    const { data } = await axios.get(this.getSelfURL());
    return data;
  }

  static getSpecificUserURL({ user_id }: APIGetUserURL) {
    return `/api/users/${user_id}`;
  }
  static async getSpecificUser({ user_id }: APIGetUserInput) {
    const { data } = await axios.get(this.getSpecificUserURL({ user_id }));
    return data;
  }
  static async updateUser({ user_id, new_user_values }) {
    const body = {
      new_user_values: new_user_values,
    };
    const { data } = await axios.put(
      this.getSpecificUserURL({ user_id }),
      body
    );
    return data;
  }
}
