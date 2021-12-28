import axios from "../utils/axios";

export default class StagesService {
  static async createStage(GSI1SK, openingId) {
    const body = {
      GSI1SK: GSI1SK,
      openingId: openingId,
    };

    const { data } = await axios.post(`/stages`, body);
    return data;
  }

  static getStageURL(stageId) {
    return `/stages/${stageId}`;
  }
  static async getStage(stageId) {
    const { data } = await axios.get(this.getStageURL(stageId));
    return data;
  }

  static async deleteStage(stageId) {
    const { data } = await axios.delete(this.getStageURL(stageId));
    return data;
  }

  static async updateStage(stageId, newValues) {
    const body = {
      newValues,
    };
    const { data } = await axios.put(this.getStageURL(stageId), body);
    return data;
  }

  static getAllQuestionsInStageURL(stageId) {
    return `/stages/${stageId}/questions`;
  }

  static async getAllQuestionsInStage(stageId) {
    const { data } = await axios.get(this.getAllQuestionsInStageURL(stageId));
    return data;
  }

  static getAllApplicantsInStageURL(openingId, stageId) {
    return `/openings/${openingId}/stages/${stageId}/applicants`;
  }

  static async getAllApplicantsInStage(openingId, stageId) {
    const { data } = await axios.get(
      this.getAllApplicantsInStageURL(openingId, stageId)
    );
    return data;
  }
}
