import { AXIOS_INSTANCE as axios } from '../Config';
import { APICreateStageOptions } from '../Controllers/Stages/create-stage';
import { APIUpdateStageOptions } from '../Controllers/Stages/update-stage';
import { DynamoStage } from '../types/dynamo';

type OpeningIdAndStageId = Pick<DynamoStage, 'openingId' | 'stageId'>;

const CreateStage = async (options: APICreateStageOptions) => {
  const data = await axios.post(`/stages`, {
    ...options,
  });
  return data;
};

const GetStageInfoURL = ({ openingId, stageId }: OpeningIdAndStageId) =>
  `/openings/${openingId}/stages/${stageId}`;

const GetStageInfo = async (options: OpeningIdAndStageId) => {
  const data = await axios.get(GetStageInfoURL({ ...options }));
  return data;
};

const DeleteStage = async (options: OpeningIdAndStageId) => {
  const data = await axios.delete(GetStageInfoURL({ ...options }));
  return data;
};

interface UpdateStageInput extends OpeningIdAndStageId {
  newValues: APIUpdateStageOptions;
}
const UpdateStage = async (options: UpdateStageInput) => {
  const { openingId, stageId } = options;
  const data = await axios.put(GetStageInfoURL({ openingId, stageId }), {
    ...options.newValues,
  });
  return data;
};

const GetStagesInOpeningURL = (openingId: string) => `/openings/${openingId}/stages`;

const GetStagesInOpening = async (openingId: string) => {
  const data = await axios.get(GetStagesInOpeningURL(openingId));
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
