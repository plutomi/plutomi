import axios from "axios";

const URL = process.env.NEXT_PUBLIC_NEXTAUTH_URL;

export default class StagesService {
  static async createStage() {
    const { data } = await axios.post(`${URL}`); // Blah blah blah
    return data;
  }
}
