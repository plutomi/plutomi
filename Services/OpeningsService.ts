import axios from "../axios/axios";

export default class OpeningsService {
  static async createOpening({ GSI1SK }: APICreateOpeningInput) {
    const body: APICreateOpeningInput = {
      GSI1SK: GSI1SK,
    };

    const { data } = await axios.post(`/openings}`);
    return data;
  }

  // Get opening by ID

  // Delete opening by ID

  // Update opening
}
