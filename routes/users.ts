import express from "express";
const router = express.Router();

router.get("/:id", (req, res) => {
  console.log("req at users");
  console.log(req.params);
  return res.status(200).json({ message: "Yeah" });
});

export default router;
