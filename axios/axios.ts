import axios from "axios";
const instance = axios.create({
  baseURL:
    `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api` ||
    `http://localhost:3000/api`,
});
export default instance;
