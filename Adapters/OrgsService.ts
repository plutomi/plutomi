import axios from "../axios/axios";

export default class OrgssService {
  static async createOrg() {
    const { data } = await axios.post(`${URL}`); // Blah blah blah
    return data;
  }
}
