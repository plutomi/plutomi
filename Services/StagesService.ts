import axios from "../axios/axios";

export default class StagesService {
  static async createStage() {
    const { data } = await axios.post(`${URL}`); // Blah blah blah
    return data;
  }
}
