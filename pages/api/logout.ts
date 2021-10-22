import withSession from "../../middleware/withSession";
import ironConfig from "../../middleware/iron-session-config";

export default withSession(async (req, res) => {
  req.session.destroy();
  res.json({ isLoggedIn: false });
});
