import axios from "../axios/axios";

export default class OrgsService {
  static async createOrg({ org_name, org_id }) {
    const body = {
      org_name: org_name,
      org_id: org_id,
    };

    const { data } = await axios.post(`/api/orgs`, body);
    return data;
  }

  static getOrgURL({ org_id }) {
    return `/api/orgs/${org_id}`;
  }
  static async getOrg({ org_id }) {
    const { data } = await axios.get(this.getOrgURL({ org_id }));
    return data;
  }

  static async deleteOrg({ org_id }) {
    const { data } = await axios.delete(this.getOrgURL({ org_id }));
    return data;
  }
  // static getAllApplicantsInStageURL({ stage_id }) {
  //   // TODO should this be under applicants?
  //   return `/api/stages/${stage_id}/applicants`;
  // }

  // static async getAllApplicantsInStage({ stage_id }) {
  //   // TODO should this be under applicants?
  //   const { data } = await axios.get(
  //     this.getAllApplicantsInStageURL({ stage_id })
  //   );
  //   return data;
  // }

  // static async updateStage({
  //   stage_id,
  //   new_stage_values,
  // }: APIUpdateStageInput) {
  //   const body = {
  //     new_stage_values: new_stage_values,
  //   };
  //   const { data } = await axios.put(this.getStageURL({ stage_id }), body);
  //   return data;
  // }

  // static getAllStagesInOpeningURL({ opening_id }: APIGetAllStagesInOpeningURL) {
  //   return `/api/openings/${opening_id}/stages`;
  // }

  // static async getAllStagesInOpening({
  //   opening_id,
  // }: APIGetAllStagesInOpeningInput) {
  //   const { data } = await axios.get(
  //     this.getAllStagesInOpeningURL({ opening_id })
  //   );
  //   return data;
  // }
}
