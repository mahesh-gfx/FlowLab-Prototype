import axios from "axios";
import { WorkflowStructure } from "@data-viz-tool/shared";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const executeWorkflow = async (
  workflowData: WorkflowStructure
): Promise<any> => {
  const response = await axios.post(
    `${API_URL}/workflow/execute-workflow`,
    workflowData
  );
  return response.data;
};
