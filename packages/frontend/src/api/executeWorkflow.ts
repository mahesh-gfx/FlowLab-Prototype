import axios from "axios";
import { WorkflowStructure } from "@data-viz-tool/shared";

const API_URL = "http://localhost:3001/api";

export const executeWorkflow = async (workflow: WorkflowStructure) => {
  const response = await axios.post(`${API_URL}/execute-workflow`, workflow);
  return response.data;
};
