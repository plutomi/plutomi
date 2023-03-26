import axios from 'axios';

export const isEven = (x: number) => {
  const axiosInstance = axios.create({
    baseURL: 'https://api.github.com',
    timeout: 1000,
    headers: { 'X-Custom-Header': 'foobar' },
  });

  return x % 2 === 0;
};
