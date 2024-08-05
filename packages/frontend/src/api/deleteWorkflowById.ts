import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const deleteWorkflowById = async (workflowId: string): Promise<any> => {
  const response = await axios.delete(
    `${API_URL}/workflow/delete-workflow-by-id`,
    { params: { workflowId } }
  );
  return response;
};
