import axios from "../axios/axios";

export default class PublicInfoService {

  static getStageURL({ stage_id }: APIGetStageURLInput) {
    return `/api/stages/${stage_id}`;
  }
  static async getStage({ stage_id }: APIGetStageInput) {
    const { data } = await axios.get(this.getStageURL({ stage_id }));
    return data;
  }

  static getAllApplicantsInStageURL({ stage_id }) {
    // TODO should this be under applicants?
    return `/api/stages/${stage_id}/applicants`;
  }

  static async getAllApplicantsInStage({ stage_id }) {
    // TODO should this be under applicants?
    const { data } = await axios.get(
      this.getAllApplicantsInStageURL({ stage_id })
    );
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
}
