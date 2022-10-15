import { AXIOS_INSTANCE as axios } from '../Config';
import { APICreateOpeningOptions } from '../Controllers/Openings/createOpening';

export const CreateOpening = async (options: APICreateOpeningOptions) => {
  const data = await axios.post(`/openings`, { ...options });
  return data;
};

export const GetOpeningInfoURL = (openingId: string) => `/openings/${openingId}`;

export const GetOpeningInfo = async (openingId: string) => {
  const data = await axios.get(GetOpeningInfoURL(openingId));
  return data;
};

export const GetOpeningsInOrgURL = () => `/openings`;

export const GetAllOpeningsInOrg = async () => {
  const data = await axios.get(GetOpeningsInOrgURL());
  return data;
};

export const DeleteOpening = async (openingId: string) => {
  const data = await axios.delete(GetOpeningInfoURL(openingId));
  return data;
};

interface UpdateOpeningInput {
  openingId: string;
  newValues: Object; // TODO types!
}
export const UpdateOpening = async (options: UpdateOpeningInput) => {
  const data = await axios.put(GetOpeningInfoURL(options.openingId), {
    ...options.newValues,
  });
  return data;
};
