import axios from "axios";
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Access API url from browser
  withCredentials: true,
});

export default instance;
