import axios from "axios";
const instance = axios.create({
  baseURL: `${process.env.PLUTOMI_URL}` || `http://localhost:3000`,
});
export default instance;
