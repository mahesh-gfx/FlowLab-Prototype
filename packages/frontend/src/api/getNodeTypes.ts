// src/api/getNodeTypes.ts

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const getNodeTypes = async (): Promise<Record<string, any>> => {
  const response = await axios.get(`${API_URL}/nodes/node-definitions`);
  return response.data;
};
