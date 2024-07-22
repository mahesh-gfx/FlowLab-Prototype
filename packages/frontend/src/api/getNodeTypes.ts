import axios from "axios";

//TODO: get API_URL from process, Update in ENV
const API_URL = "http://localhost:3001/api";

export const getNodeTypes = async (): Promise<string[]> => {
  const response = await axios.get(`${API_URL}/node-types`);
  return response.data;
};
