import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const deleteWorkflowById = async (workflowId: string): Promise<any> => {
  console.log("Workflowid for deletion: ", workflowId);
  const response = await axios.delete(
    `${API_URL}/workflow/delete-workflow-by-id`,
    { data: { workflowId } }
  );
  return response;
};
