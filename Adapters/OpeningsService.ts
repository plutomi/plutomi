import axios from "axios";

export default class OpeningsService {
  static async createOpening(GSI1SK) {
    const body = {
      GSI1SK: GSI1SK,
    };

    const { data } = await axios.post(`/openings`, body);
    return data;
  }

  static getOpeningURL(openingId) {
    return `/openings/${openingId}`;
  }
  static async getOpening(openingId) {
    const { data } = await axios.get(this.getOpeningURL(openingId));
    return data;
  }

  static getAllOpeningsURL() {
    return `/openings`;
  }

  static async getAllOpenings() {
    const { data } = await axios.get(this.getAllOpeningsURL());
    return data;
  }

  static async deleteOpening(openingId) {
    const { data } = await axios.delete(this.getOpeningURL(openingId));
    return data;
  }

  static async updateOpening(openingId, newOpeningValues) {
    const body = {
      newOpeningValues: newOpeningValues,
    };
    const { data } = await axios.put(this.getOpeningURL(openingId), body);
    return data;
  }

  // TODO should this be moved to openings?
  static getAllStagesInOpeningURL(openingId) {
    return `/openings/${openingId}/stages`;
  }

  static async getAllStagesInOpening(openingId) {
    const { data } = await axios.get(this.getAllStagesInOpeningURL(openingId));
    return data;
  }

  // static getAllApplicantsInOpeningURL({ openingId }) { // TODO expensive call if there are a lot of applicants - should this be enabled?
  //   return `/openings/${openingId}/applicants`;
  // }

  // static async getAllApplicantsInOpening({ openingId }) {
  //   const { data } = await axios.get(
  //     this.getAllApplicantsInOpeningURL({ openingId })
  //   );
  //   return data;
  // }
}
