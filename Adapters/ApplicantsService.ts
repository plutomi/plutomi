import axios from "../utils/axios";
export default class ApplicantsService {
  static async createApplicant({
    orgId,
    openingId,
    firstName,
    lastName,
    email,
  }) {
    const body = {
      orgId,
      openingId,
      firstName,
      lastName,
      email,
    };

    const { data } = await axios.post(`/applicants`, body);
    return data;
  }

  static getApplicantURL(applicantId) {
    return `/applicants/${applicantId}`;
  }
  static async getApplicant(applicantId) {
    const { data } = await axios.get(this.getApplicantURL(applicantId));
    return data;
  }

  static async deleteApplicant(applicantId) {
    const { data } = await axios.delete(this.getApplicantURL(applicantId));
    return data;
  }

  static async updateApplicant(applicantId, newApplicantValues) {
    const body = {
      newApplicantValues: newApplicantValues,
    };
    const { data } = await axios.put(this.getApplicantURL(applicantId), body);
    return data;
  }

  static answerQuestionsURL(applicantId) {
    return `/applicants/${applicantId}/answer`; // TODO applicantId is being used in query as well as body. TODO maybe add unique question ids?
  }
  static async answerQuestions(applicantId, responses) {
    console.log("rrreee", responses);
    const body = {
      applicantId,
      responses,
    };
    const { data } = await axios.post(
      this.answerQuestionsURL(applicantId),
      body
    );
    return data;
  }
}
