import type { NextApiRequest, NextApiResponse } from "next";
import { API } from "../../utils/axiosInstance";

type ResponseData = {
  message: string;
  responseFromApi: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // eslint-disable-next-line no-console
  console.log("Axios URL", API.defaults.baseURL);
  // eslint-disable-next-line no-console
  console.log("AXIOS", API.defaults);

  try {
    const x = await API.get("/ssr");
    res.status(200).json({
      message: `SSR - ${new Date().toISOString()}`,
      responseFromApi: x.data
    });
  } catch (error) {
    res.status(200).json({
      message: `SSR - ${new Date().toISOString()}`,
      responseFromApi: "nothing, we errored out"
    });
  }
}
