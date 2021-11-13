import axios from "../axios/axios";

export default class UsersService {
  static getSelfURL() {
    return `/api/users/self`;
  }
  static async getSelf() {
    const { data } = await axios.get(this.getSelfURL());
    return data;
  }

  static getSpecificUserURL(userId) {
    return `/api/users/${userId}`;
  }
  static async getSpecificUser(userId) {
    const { data } = await axios.get(this.getSpecificUserURL(userId));
    return data;
  }
  static async updateUser(userId, { newUserValues }) {
    const body = {
      newUserValues: newUserValues,
    };
    const { data } = await axios.put(this.getSpecificUserURL(userId), body);
    return data;
  }
}
