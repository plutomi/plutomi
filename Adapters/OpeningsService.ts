import axios from "../axios/axios";

export default class OpeningsService {
  static async createOpening({ GSI1SK }: APICreateOpeningInput) {
    const body = {
      GSI1SK: GSI1SK,
    };

    const { data } = await axios.post(`/api/openings`, body);
    return data;
  }

  static getOpeningURL({ opening_id }) {
    return `/api/openings/${opening_id}`;
  }
  static async getOpening({ opening_id }: APIGetOpeningInput) {
    const { data } = await axios.get(this.getOpeningURL({ opening_id }));
    return data;
  }

  static getAllOpeningsURL() {
    return `/api/openings`;
  }

  static async getAllOpenings() {
    const { data } = await axios.get(this.getAllOpeningsURL());
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
    const body = {
      new_opening_values: new_opening_values,
    };
    const { data } = await axios.put(this.getOpeningURL({ opening_id }), body);
    return data;
  }

  // TODO should this be moved to openings?
  static getAllStagesInOpeningURL({ opening_id }: APIGetAllStagesInOpeningURL) {
    return `/api/openings/${opening_id}/stages`;
  }

  static async getAllStagesInOpening({
    opening_id,
  }: APIGetAllStagesInOpeningInput) {
    const { data } = await axios.get(
      this.getAllStagesInOpeningURL({ opening_id })
    );
    return data;
  }

  // static getAllApplicantsInOpeningURL({ opening_id }) { // TODO expensive call if there are a lot of applicants - should this be enabled?
  //   return `/api/openings/${opening_id}/applicants`;
  // }

  // static async getAllApplicantsInOpening({ opening_id }) {
  //   const { data } = await axios.get(
  //     this.getAllApplicantsInOpeningURL({ opening_id })
  //   );
  //   return data;
  // }
}
