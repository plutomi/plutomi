import axios from "../utils/axios";

export default class OpeningsService {
  static async createOpening(openingName) {
    const body = {
      openingName,
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

  static async updateOpening(openingId, newValues) {
    const { data } = await axios.put(this.getOpeningURL(openingId), newValues);
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
}
