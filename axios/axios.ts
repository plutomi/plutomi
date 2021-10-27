import axios from "axios";
const instance = axios.create({
  baseURL: `${process.env.WEBSITE_URL}` || `http://localhost:3000`,
});
export default instance;
