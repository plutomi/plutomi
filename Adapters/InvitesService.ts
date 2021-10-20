import axios from "../axios/axios";

export default class InvitesService {
  static async createInvite() {
    const { data } = await axios.post(`${URL}`); // Blah blah blah
    return data;
  }
}
