import axios from "axios";

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

  static async updateStage(stageId, newStageValues) {
    const body = {
      newStageValues: newStageValues,
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

  static getAllApplicantsInStageURL(stageId) {
    return `/stages/${stageId}/applicants`;
  }

  static async getAllApplicantsInStage(stageId) {
    const { data } = await axios.get(this.getAllApplicantsInStageURL(stageId));
    return data;
  }
}
