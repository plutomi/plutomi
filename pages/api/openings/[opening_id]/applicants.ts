import withAuthorizer from "../../../../middleware/withAuthorizer";
import { NextApiResponse } from "next";
import { GetAllApplicantsInStage } from "../../../../utils/applicants/getAllApplicantsInStage";

const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const user: DynamoUser = req.user;
  const { stage_id, opening_id } = query;

  // Get all applicants in a stage
  //   if (method === "GET") { // TODO TODO TODO GET ALL APPLICANTS IN OPENING -- THIS IS WRONG
  //     const get_all_applicants_in_stage_input: GetAllApplicantsInStageInput = {
  //       org_id: user.org_id,
  //       opening_id: opening_id as string,
  //       stage_id: stage_id as string,
  //     };

  //     console.log("Input", get_all_applicants_in_stage_input);
  //     try {
  //       const all_applicants = await GetAllApplicantsInStage(
  //         get_all_applicants_in_stage_input
  //       );
  //       return res.status(200).json(all_applicants);
  //     } catch (error) {
  //       // TODO add error logger
  //       return res
  //         .status(400) // TODO change #
  //         .json({ message: `Unable to retrieve applicants: ${error}` });
  //     }
  //   }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
