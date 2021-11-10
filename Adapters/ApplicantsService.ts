import axios from "../axios/axios";

export default class ApplicantsService {
  static async createApplicant({
    orgId,
    openingId,
    first_name,
    last_name,
    email,
  }) {
    const body = {
      orgId,
      openingId,
      first_name,
      last_name,
      email,
    };

    const { data } = await axios.post(`/api/applicants`, body);
    return data;
  }

  static getApplicantURL({ applicantId }) {
    return `/api/applicants/${applicantId}`;
  }
  static async getApplicant({ applicantId }) {
    const { data } = await axios.get(this.getApplicantURL({ applicantId }));
    return data;
  }

  static async deleteApplicant({ applicantId }) {
    const { data } = await axios.delete(this.getApplicantURL({ applicantId }));
    return data;
  }

  static async updateApplicant({ applicantId, new_applicant_values }) {
    const body = {
      new_applicant_values: new_applicant_values,
    };
    const { data } = await axios.put(
      this.getApplicantURL({ applicantId }),
      body
    );
    return data;
  }

  static answerQuestionsURL({ orgId, applicantId }) {
    return `/api/public/orgs/${orgId}/applicants/${applicantId}/answer`;
  }
  static async answerQuestions({ orgId, applicantId, responses }) {
    const body = {
      applicantId: applicantId,
      responses: responses,
    };
    const { data } = await axios.post(
      this.answerQuestionsURL({ orgId, applicantId }),
      body
    );
    return data;
  }
}
