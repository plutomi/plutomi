import axios from "axios";
import { API_URL } from "../Config";
const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default instance;
