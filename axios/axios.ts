import axios from "axios";
const port = process.env.EXPRESS_PORT;
const instance = axios.create({
  baseURL:
    `${process.env.NEXT_PUBLIC_WEBSITE_URL}` || `http://localhost:${port}`, // TODO change this to API
});
export default instance;
