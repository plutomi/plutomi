import express from "express";
import users from "./routes/users";require("dotenv").config();
const port = process.env.EXPRESS_PORT;

const app = express();
app.use("/users", users);

app.listen(port, () => {
  console.log(`Server running ${port}.`);
});
