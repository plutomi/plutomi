import axios from "../axios/axios";

export default class ApplicantsService {
  static async createApplicant({
    org_id,
    opening_id,
    first_name,
    last_name,
    email,
  }) {
    const body = {
      org_id,
      opening_id,
      first_name,
      last_name,
      email,
    };

    const { data } = await axios.post(`/api/applicants`, body);
    return data;
  }

  static getApplicantURL({ applicant_id }) {
    return `/api/applicants/${applicant_id}`;
  }
  static async getApplicant({ applicant_id }) {
    const { data } = await axios.get(this.getApplicantURL({ applicant_id }));
    return data;
  }

  static async deleteApplicant({ applicant_id }) {
    const { data } = await axios.delete(this.getApplicantURL({ applicant_id }));
    return data;
  }

  static async updateApplicant({ applicant_id, new_applicant_values }) {
    const body = {
      new_applicant_values: new_applicant_values,
    };
    const { data } = await axios.put(
      this.getApplicantURL({ applicant_id }),
      body
    );
    return data;
  }

  static answerQuestionsURL({ org_id, applicant_id }) {
    return `/api/public/orgs/${org_id}/applicants/${applicant_id}/answer`;
  }
  static async answerQuestions({ org_id, applicant_id, responses }) {
    const body = {
      applicant_id: applicant_id,
      responses: responses,
    };
    const { data } = await axios.post(
      this.answerQuestionsURL({ org_id, applicant_id }),
      body
    );
    return data;
  }
}
