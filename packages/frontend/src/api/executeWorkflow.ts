import axios from "axios";
import { WorkflowStructure } from "@data-viz-tool/shared";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const executeWorkflow = (
  workflowData: WorkflowStructure,
  onNodeExecuted: (data: { nodeId: string; output: any }) => void,
  onNodeError: (data: { nodeId: string; error: string }) => void,
  onWorkflowCompleted: (success: boolean) => void
): void => {
  // First, set up the SSE connection
  console.log("Setting up EventSource");
  const eventSource = new EventSource(
    `${API_URL}/workflow/execute-workflow-stream`
  );

  eventSource.addEventListener("nodeExecuted", (event) => {
    console.log("Node executed event received", event);
    const data = JSON.parse(event.data);
    onNodeExecuted(data);
  });

  eventSource.addEventListener("nodeError", (event) => {
    console.log("Node error event received", event);
    const data = JSON.parse(event.data);
    console.log("NODE ERROR DATA", data);
    onNodeError(data);
  });

  eventSource.addEventListener("workflowCompleted", (event) => {
    console.log("Workflow completed event received", event);
    onWorkflowCompleted(true);
    eventSource.close();
  });

  eventSource.addEventListener("workflowCompletedWithErrors", (event) => {
    console.log("Workflow completed with errors event received", event);
    onWorkflowCompleted(false);
    eventSource.close();
  });

  eventSource.onerror = (error) => {
    console.error("EventSource failed:", error);
    eventSource.close();
  };

  // Then, start the workflow execution
  axios
    .post(`${API_URL}/workflow/execute-workflow`, workflowData)
    .then(() => {
      console.log("Workflow execution started");
    })
    .catch((error) => {
      console.error("Failed to start workflow execution:", error);
      eventSource.close();
    });
};
