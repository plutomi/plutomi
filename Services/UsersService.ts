import axios from "../axios/axios";

export default class UsersService {
  static async createUser() {
    const { data } = await axios.post(`${URL}`); // Blah blah blah
    return data;
  }
}
