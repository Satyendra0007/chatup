
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

export const useAxiosClient = () => {
  const { getToken } = useAuth();

  const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL, 
  });

  axiosClient.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return axiosClient;
};
