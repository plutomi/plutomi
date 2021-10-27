import axios from "../axios/axios";

export default class StagesService {
  static async createStage({ GSI1SK, opening_id }: APICreateStageInput) {
    const body = {
      GSI1SK: GSI1SK,
      opening_id: opening_id,
    };

    const { data } = await axios.post(`/api/stages`, body);
    return data;
  }

  static getStageURL({ stage_id }: APIGetStageURLInput) {
    return `/api/stages/${stage_id}`;
  }
  static async getStage({ stage_id }: APIGetStageInput) {
    const { data } = await axios.get(this.getStageURL({ stage_id }));
    return data;
  }

  static async deleteStage({ stage_id }: APIDeleteStageInput) {
    const { data } = await axios.delete(this.getStageURL({ stage_id }));
    return data;
  }

  static async updateStage({
    stage_id,
    new_stage_values,
  }: APIUpdateStageInput) {
    const body = {
      new_stage_values: new_stage_values,
    };
    const { data } = await axios.put(this.getStageURL({ stage_id }), body);
    return data;
  }

  static getAllQuestionsInStageURL({ stage_id }) {
    return `/api/stages/${stage_id}/questions`;
  }

  static async getAllQuestionsInStage({ stage_id }) {
    const { data } = await axios.get(
      this.getAllQuestionsInStageURL({ stage_id })
    );
    return data;
  }

  static getAllApplicantsInStageURL({ stage_id }) {
    return `/api/stages/${stage_id}/applicants`;
  }

  static async getAllApplicantsInStage({ stage_id }) {
    const { data } = await axios.get(
      this.getAllApplicantsInStageURL({ stage_id })
    );
    return data;
  }
}
