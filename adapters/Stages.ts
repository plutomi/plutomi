import { AXIOS_INSTANCE as axios } from "../Config";
// TODO types
const CreateStage = async (GSI1SK, openingId) => {
  const { data } = await axios.post(`/stages`, {
    GSI1SK,
    openingId,
  });
  return data;
};

const GetStageInfoURL = (openingId, stageId) =>
  `/openings/${openingId}/stages/${stageId}`;

const GetStageInfo = async (openingId, stageId) => {
  const { data } = await axios.get(GetStageInfoURL(openingId, stageId));
  return data;
};

const DeleteStage = async (openingId, stageId) => {
  const { data } = await axios.delete(GetStageInfoURL(openingId, stageId));
  return data;
};

const UpdateStage = async (openingId, stageId, newValues) => {
  const { data } = await axios.put(
    GetStageInfoURL(openingId, stageId),
    newValues
  );
  return data;
};

const GetStagesInOpeningURL = (openingId) => `/openings/${openingId}/stages`;

const GetStagesInOpening = async (openingId) => {
  const { data } = await axios.get(GetStagesInOpening(openingId));
  return data;
};

export {
  GetStagesInOpening,
  GetStagesInOpeningURL,
  UpdateStage,
  DeleteStage,
  GetStageInfo,
  GetStageInfoURL,
  CreateStage,
};
