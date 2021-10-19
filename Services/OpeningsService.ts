import axios from "../axios/axios";

export default class OpeningsService {
  static async CreateOpening({ GSI1SK }: APICreateOpeningInput) {
    const body: APICreateOpeningInput = {
      GSI1SK: GSI1SK,
    };

    const { data } = await axios.post(`/openings`, body);
    return data;
  }

  static async GetOpeningById({ opening_id }: APIGetOpeningByIdInput) {
    const { data } = await axios.get(`/openings/${opening_id}`);
    return data;
  }

  // Delete opening by ID

  // Update opening
}
