import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const getNodeConfig = async (
  type: string
): Promise<Record<string, any>> => {
  const response = await axios.get(`${API_URL}/node-config/${type}`);
  return response.data;
};
