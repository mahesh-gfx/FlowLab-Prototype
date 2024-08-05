import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  status?: number;
  message: string;
  error?: boolean;
}

interface VerifyTokenResponse {
  valid: boolean;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const register = async (
  firstName: string,
  lastName: string,
  age: number,
  email: string,
  password: string
): Promise<RegisterResponse> => {
  return axios
    .post(`${API_URL}/auth/register`, {
      firstName,
      lastName,
      age,
      email,
      password,
    })
    .then((response) => {
      console.log("Response.data: ", response.data);
      return response.data;
    })
    .catch((error) => {
      return { error: true, message: error.response.data.message };
    });
};

export const verifyToken = async (
  token: string
): Promise<VerifyTokenResponse> => {
  const response = await axios.post(`${API_URL}/auth/verify-token`, { token });
  return response.data;
};
