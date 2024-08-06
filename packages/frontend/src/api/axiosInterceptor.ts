import axios from "axios";
import { store } from "../store/store";
import { logout } from "../store/authSlice";

const setupAxiosInterceptors = () => {
  axios.defaults.baseURL =
    process.env.REACT_APP_API_URL || "http://localhost:3001/api";

  axios.interceptors.request.use(
    (config) => {
      const token = store.getState().auth.token;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        store.dispatch(logout());
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;