import { EventSourcePolyfill } from "event-source-polyfill";
import axios from "axios";
import { WorkflowStructure } from "@data-viz-tool/shared";
import { store } from "../store/store"; // Assuming you have a Redux store setup

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const executeWorkflow = (
  workflowId: string,
  workflowData: WorkflowStructure,
  onNodeExecuted: (data: { nodeId: string; output: any }) => void,
  onNodeError: (data: { nodeId: string; error: string }) => void,
  onWorkflowCompleted: (success: boolean) => void
): void => {
  // Get the token from the Redux store
  const token = store.getState().auth.token;

  // Set up the SSE connection with the Authorization header
  console.log("Setting up EventSource");
  const eventSource = new EventSourcePolyfill(
    `${API_URL}/workflow/execute-workflow-stream`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  //@ts-ignore
  eventSource.addEventListener("nodeExecuted", (event: Event) => {
    const messageEvent = event as MessageEvent;
    console.log("Node executed event received", messageEvent);
    const data = JSON.parse(messageEvent.data);
    onNodeExecuted(data);
  });

  //@ts-ignore
  eventSource.addEventListener("nodeError", (event: Event) => {
    const messageEvent = event as MessageEvent;
    console.log("Node error event received", messageEvent);
    const data = JSON.parse(messageEvent.data);
    console.log("NODE ERROR DATA", data);
    onNodeError(data);
  });

  //@ts-ignore
  eventSource.addEventListener("workflowCompleted", (event: Event) => {
    const messageEvent = event as MessageEvent;
    console.log("Workflow completed event received", messageEvent);
    onWorkflowCompleted(true);
    eventSource.close();
  });

  //@ts-ignore
  eventSource.addEventListener(
    "workflowCompletedWithErrors",
    (event: Event) => {
      const messageEvent = event as MessageEvent;
      console.log(
        "Workflow completed with errors event received",
        messageEvent
      );
      onWorkflowCompleted(false);
      eventSource.close();
    }
  );

  //@ts-ignore
  eventSource.onerror = (error: Event) => {
    console.error("EventSource failed:", error);
    eventSource.close();
  };

  // Start the workflow execution
  axios
    .post(
      `${API_URL}/workflow/execute-workflow`,
      { workflowId, workflowData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(() => {
      console.log("Workflow execution started");
    })
    .catch((error) => {
      console.error("Failed to start workflow execution:", error);
      eventSource.close();
    });
};
