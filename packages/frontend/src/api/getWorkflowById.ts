import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const getWorkflowById = async (workflowId: string): Promise<any> => {
  const response = await axios.get(`${API_URL}/workflow/workflow-by-id`, {
    params: { workflowId },
  });
  return response;
};
