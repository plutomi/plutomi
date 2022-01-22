import axios from "../utils/axios";
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

const GetAllStagesInOpeningURL = (openingId) => `/openings/${openingId}/stages`;

const GetAllStagesInOpening = async (openingId) => {
  const { data } = await axios.get(GetAllStagesInOpening(openingId));
  return data;
};

export {
  GetAllStagesInOpening,
  GetAllStagesInOpeningURL,
  UpdateStage,
  DeleteStage,
  GetStageInfo,
  GetStageInfoURL,
  CreateStage,
};
