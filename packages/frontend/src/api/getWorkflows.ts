import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const getWorkflows = async (): Promise<any> => {
  const response = await axios.get(`${API_URL}/workflow/workflows`);
  return response;
};
