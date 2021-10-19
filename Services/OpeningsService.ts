import axios from "../axios/axios";

export default class OpeningsService {
  static async createOpening({ GSI1SK }: APICreateOpeningInput) {
    const body: APICreateOpeningInput = {
      GSI1SK: GSI1SK,
    };

    const { data } = await axios.post(`/openings`, body);
    return data;
  }

  static getOpeningURL({ opening_id }) {
    return `/api/openings/${opening_id}`;
  }
  static async getOpening({ opening_id }: APIGetOpeningInput) {
    const { data } = await axios.get(this.getOpeningURL({ opening_id }));
    return data;
  }

  static async deleteOpening({ opening_id }: APIDeleteOpeningInput) {
    const { data } = await axios.delete(this.getOpeningURL({ opening_id }));
    return data;
  }

  static async updateOpening({
    opening_id,
    new_opening_values,
  }: APIUpdateOpeningInput) {
    const body: APIUpdateOpeningInput = {
      opening_id: opening_id,
      new_opening_values: new_opening_values,
    };
    const { data } = await axios.put(this.getOpeningURL({ opening_id }), body);
    return data;
  }
}
