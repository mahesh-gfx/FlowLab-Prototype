import express from "express";
import { WorkflowService } from "../services/workflowService";
import { WorkflowStructure } from "@data-viz-tool/shared";

const router = express.Router();

router.post("/execute-workflow", (req, res) => {
  const workflowData: WorkflowStructure = req.body;
  req.app.locals.pendingWorkflow = workflowData;
  res.status(200).send("Workflow received");
});

router.get("/execute-workflow-stream", (req, res) => {
  const workflowService = new WorkflowService();
  console.log("SSE connection established");
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const sendEvent = (event: string, data: any) => {
    if (!res.finished) {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  const handleNodeExecuted = (data: { nodeId: string; output: any }) =>
    sendEvent("nodeExecuted", data);

  const handleNodeError = (data: { nodeId: string; error: string }) => {
    sendEvent("nodeError", data);
    cleanupAndClose();
  };

  const handleWorkflowCompleted = () => {
    sendEvent("workflowCompleted", {});
    cleanupAndClose();
  };

  const handleWorkflowCompletedWithErrors = () => {
    sendEvent("workflowCompletedWithErrors", {});
    cleanupAndClose();
  };

  const cleanupAndClose = () => {
    cleanupListeners();
    res.end();
  };

  const cleanupListeners = () => {
    workflowService.removeListener("nodeExecuted", handleNodeExecuted);
    workflowService.removeListener("nodeError", handleNodeError);
    workflowService.removeListener(
      "workflowCompleted",
      handleWorkflowCompleted
    );
    workflowService.removeListener(
      "workflowCompletedWithErrors",
      handleWorkflowCompletedWithErrors
    );
  };

  workflowService.on("nodeExecuted", handleNodeExecuted);
  workflowService.on("nodeError", handleNodeError);
  workflowService.on("workflowCompleted", handleWorkflowCompleted);
  workflowService.on(
    "workflowCompletedWithErrors",
    handleWorkflowCompletedWithErrors
  );

  // Start the workflow execution after the SSE connection is established
  if (req.app.locals.pendingWorkflow) {
    workflowService.executeWorkflow(req.app.locals.pendingWorkflow);
    req.app.locals.pendingWorkflow = null;
  }

  req.on("close", () => {
    console.log("SSE connection closed");
    cleanupListeners();
  });
});

export default router;
