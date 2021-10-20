import axios from "../axios/axios";

export default class UsersService {
  static async createStage({ GSI1SK, opening_id }: APICreateStageInput) {
    const body = {
      GSI1SK: GSI1SK,
      opening_id: opening_id,
    };

    const { data } = await axios.post(`/api/stages`, body);
    return data;
  }

  static getStageURL({ opening_id, stage_id }: APIGetStageURLInput) {
    return `/api/openings/${opening_id}/stages/${stage_id}`;
  }
  static async getStage({ opening_id, stage_id }: APIGetStageInput) {
    const { data } = await axios.get(
      this.getStageURL({ opening_id, stage_id })
    );
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

  static async deleteStage({ opening_id, stage_id }: APIDeleteStageInput) {
    const { data } = await axios.delete(
      this.getStageURL({ opening_id, stage_id })
    );
    return data;
  }

  static async updateStage({
    opening_id,
    stage_id,
    new_stage_values,
  }: APIUpdateStageInput) {
    const body = {
      new_stage_values: new_stage_values,
    };
    const { data } = await axios.put(
      this.getStageURL({ opening_id, stage_id }),
      body
    );
    return data;
  }
}
