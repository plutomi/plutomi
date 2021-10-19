import axios from "../axios/axios";

export default class OpeningsService {
  static async CreateOpening({ GSI1SK }: APICreateOpeningInput) {
    const body: APICreateOpeningInput = {
      GSI1SK: GSI1SK,
    };

    const { data } = await axios.post(`/openings`, body);
    return data;
  }

  static async GetOpening({ opening_id }: APIGetOpeningInput) {
    const { data } = await axios.get(`/openings/${opening_id}`);
    return data;
  }

  static async DeleteOpening({ opening_id }: APIDeleteOpeningInput) {
    const { data } = await axios.delete(`/openings/${opening_id}`);
    return data;
  }

  static async UpdateOpening({
    opening_id,
    new_opening_values,
  }: APIUpdateOpeningInput) {
    const body: APIUpdateOpeningInput = {
      opening_id: opening_id,
      new_opening_values: new_opening_values,
    };
    const { data } = await axios.put(`/openings/${opening_id}`, body);
    return data;
  }

}
