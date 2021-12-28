import axios from "../utils/axios";

export default class UsersService {
  static getSelfURL() {
    return `/users/self`;
  }
  static async getSelf() {
    const { data } = await axios.get(this.getSelfURL());
    return data;
  }

  static getSpecificUserURL(userId) {
    return `/users/${userId}`;
  }
  static async getSpecificUser(userId) {
    const { data } = await axios.get(this.getSpecificUserURL(userId));
    return data;
  }
  static async updateUser(userId, newValues) {
    const body = {
      newValues,
    };
    const { data } = await axios.put(this.getSpecificUserURL(userId), body);
    return data;
  }
}
