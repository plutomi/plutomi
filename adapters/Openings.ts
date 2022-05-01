import { AXIOS_INSTANCE as axios } from '../Config';
import { APICreateOpeningOptions } from '../Controllers/Openings/create-opening';
import { APIUpdateOpeningOptions } from '../Controllers/Openings/update-opening';

const CreateOpening = async (options: APICreateOpeningOptions) => {
  const data = await axios.post(`/openings`, { ...options });
  return data;
};

const GetOpeningInfoURL = (openingId: string) => `/openings/${openingId}`;

const GetOpeningInfo = async (openingId: string) => {
  const data = await axios.get(GetOpeningInfoURL(openingId));
  return data;
};

const GetOpeningsInOrgURL = () => `/openings`;

const GetAllOpeningsInOrg = async () => {
  const data = await axios.get(GetOpeningsInOrgURL());
  return data;
};

const DeleteOpening = async (openingId: string) => {
  const data = await axios.delete(GetOpeningInfoURL(openingId));
  return data;
};

interface UpdateOpeningInput {
  openingId: string;
  newValues: APIUpdateOpeningOptions;
}
const UpdateOpening = async (options: UpdateOpeningInput) => {
  const data = await axios.put(GetOpeningInfoURL(options.openingId), {
    ...options.newValues,
  });
  return data;
};

export {
  CreateOpening,
  UpdateOpening,
  DeleteOpening,
  GetAllOpeningsInOrg,
  GetOpeningsInOrgURL,
  GetOpeningInfo,
  GetOpeningInfoURL,
};
