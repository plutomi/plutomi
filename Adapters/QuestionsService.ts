import axios from "../utils/axios";

export default class QuestionsService {
  static async createQuestion(GSI1SK, stageId, questionDescription) {
    const body = {
      stageId: stageId,
      GSI1SK: GSI1SK,
      questionDescription: questionDescription,
    };

    const { data } = await axios.post(`/questions`, body);
    return data;
  }

  static getQuestionURL(questionId) {
    return `/questions/${questionId}`;
  }
  static async getQuestion(questionId) {
    const { data } = await axios.get(this.getQuestionURL(questionId));
    return data;
  }

  static async deleteQuestion(questionId) {
    const { data } = await axios.delete(this.getQuestionURL(questionId));
    return data;
  }
  static async updateQuestion(questionId, newValues) {
    const body = {
      newValues,
    };
    const { data } = await axios.put(this.getQuestionURL(questionId), body);
    return data;
  }
}
