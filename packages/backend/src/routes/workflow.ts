import express, { Request, Response } from "express";
import { WorkflowService } from "../services/workflowService";
import { WorkflowStructure } from "@data-viz-tool/shared";
import authService from "../services/authService";

const router = express.Router();
const workflowService = new WorkflowService();

router.post("/execute-workflow", async (req: Request, res: Response) => {
  const workflowData: WorkflowStructure = req.body;

  //Save workflow before executing and return the saved workflow id
  const workflowName = workflowData.nodes[0].data.properties?.workflowName;
  const workflowdescription =
    workflowData.nodes[0].data.properties?.description;

  const userId = authService.getUserFromAuthHeader(req.headers.authorization);

  const response = await workflowService.saveWorkflow(
    workflowName,
    workflowdescription,
    userId,
    workflowData.nodes,
    workflowData.edges
  );

  console.log("Save workflow response: ", response);

  if (response != null) {
    req.app.locals.pendingWorkflow = workflowData;
    req.app.locals.authorization = req.headers.authorization;
    res.status(200).send("Workflow received");
  } else res.status(500).send("Error saving workflow before execution!");
});

router.get("/execute-workflow-stream", (req, res) => {
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

// router.post("/save-workflow", (req, res) => {
//   const workflowService = new WorkflowService();
//   workflowService.saveWorkflow(req, res);
// });

router.get("/workflows", async (req: Request, res: Response) => {
  const userId = authService.getUserFromAuthHeader(req.headers.authorization);
  const data = await workflowService.getWorkflowsByUser(userId);
  console.log("Workflows: ", data);
  if (data.data.status == 200) res.status(200).send(data.data);
  else res.status(data.data.status).send(data.data);
});

router.get("/workflow-by-id", async (req: Request, res: Response) => {
  const userId = authService.getUserFromAuthHeader(req.headers.authorization);
  const data = await workflowService.getWorkflowByIdAndUserId(
    userId,
    req.params.workflowId
  );
  console.log("Workflow by ID: ", data);
  if (data.data.status == 200) res.status(200).send(data.data);
  else res.status(data.data.status).send(data.data);
});

router.delete("/delete-workflow-by-id", async (req: Request, res: Response) => {
  const userId = authService.getUserFromAuthHeader(req.headers.authorization);
  const workflowId = req.params.workflowId;
  console.log("Workflow id for deletion: ", workflowId);
  const data = await workflowService.deleteWorkflowById(workflowId, userId);
  if (data.data.status == 200) res.status(200).send(data.data);
  else res.status(data.data.status).send(data.data);
});

export default router;
