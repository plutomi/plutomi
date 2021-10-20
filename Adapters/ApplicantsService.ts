import axios from "../axios/axios";

export default class ApplicantsService {
  static async createApplicant() {
    const { data } = await axios.post(`${URL}`); // Blah blah blah
    return data;
  }
}
