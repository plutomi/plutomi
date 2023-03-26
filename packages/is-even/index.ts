import axios from 'axios';

export const isEven = (x: number) => {
  const axiosInstance = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 1000,
    headers: { 'X-Custom-Header': 'foobar' },
  });
  console.log(typeof axiosInstance);
  return x % 2 === 0;
};
