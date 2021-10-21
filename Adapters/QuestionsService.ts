import axios from "../axios/axios";

export default class QuestionsService {
  static async createQuestion({ GSI1SK, stage_id, question_description }) {
    const body = {
      stage_id: stage_id,
      GSI1SK: GSI1SK,
      question_description: question_description,
    };

    const { data } = await axios.post(`/api/questions`, body);
    return data;
  }

  static getQuestionURL({ question_id }) {
    return `/api/questions/${question_id}`;
  }
  static async getQuestion({ question_id }) {
    const { data } = await axios.get(this.getQuestionURL({ question_id }));
    return data;
  }

  static async deleteQuestion({ question_id }) {
    const { data } = await axios.delete(this.getQuestionURL({ question_id }));
    return data;
  }
  static async updateQuestion({ question_id, new_question_values }) {
    const body = {
      new_question_values: new_question_values,
    };
    const { data } = await axios.put(
      this.getQuestionURL({ question_id }),
      body
    );
    return data;
  }
}
