import axios from "axios";
import { API_URL } from "../Config";
const instance = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

export default instance;
