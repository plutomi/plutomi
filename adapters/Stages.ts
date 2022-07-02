import { AXIOS_INSTANCE as axios } from '../Config';
import { APICreateStageOptions } from '../Controllers/Stages/createStage';
import { APIUpdateStageOptions } from '../Controllers/Stages/updateStage';
import { DynamoStage } from '../types/dynamo';

type OpeningIdAndStageId = Pick<DynamoStage, 'openingId' | 'stageId'>;

export const CreateStage = async (options: APICreateStageOptions) => {
  const data = await axios.post(`/stages`, {
    ...options,
  });
  return data;
};

export const GetStageInfoURL = ({ openingId, stageId }: OpeningIdAndStageId) =>
  `/openings/${openingId}/stages/${stageId}`;

export const GetStageInfo = async (options: OpeningIdAndStageId) => {
  const data = await axios.get(GetStageInfoURL({ ...options }));
  return data;
};

export const DeleteStage = async (options: OpeningIdAndStageId) => {
  const data = await axios.delete(GetStageInfoURL({ ...options }));
  return data;
};

interface UpdateStageInput extends OpeningIdAndStageId {
  newValues: APIUpdateStageOptions;
}
export const UpdateStage = async (options: UpdateStageInput) => {
  const { openingId, stageId } = options;
  const data = await axios.put(GetStageInfoURL({ openingId, stageId }), {
    ...options.newValues,
  });
  return data;
};

export const GetStagesInOpeningURL = (openingId: string) => `/openings/${openingId}/stages`;

export const GetStagesInOpening = async (openingId: string) => {
  const data = await axios.get(GetStagesInOpeningURL(openingId));
  return data;
};
