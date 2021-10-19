import axios from "../axios/axios";

export default class RulesService {
  static async createRule() {
    const { data } = await axios.post(`${URL}`); // Blah blah blah
    return data;
  }
}
