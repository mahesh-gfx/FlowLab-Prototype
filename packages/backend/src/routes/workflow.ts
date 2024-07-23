import express from "express";
import { workflowService } from "../services/workflowService";
import { WorkflowStructure } from "@data-viz-tool/shared";

const router = express.Router();

router.post("/execute-workflow", async (req, res) => {
  try {
    const workflowData: WorkflowStructure = req.body;

    // Validate the workflow structure
    if (
      !workflowData ||
      !Array.isArray(workflowData.nodes) ||
      !Array.isArray(workflowData.edges)
    ) {
      return res.status(400).json({ error: "Invalid workflow structure" });
    }

    // Execute the workflow
    const result = await workflowService.executeWorkflow(workflowData);

    // Check if any nodes failed to execute
    const errors = Object.entries(result)
      .filter(
        ([_, nodeResult]) =>
          nodeResult && typeof nodeResult === "object" && "error" in nodeResult
      )
      .map(([nodeId, nodeResult]) => ({
        nodeId,
        error: (nodeResult as { error: string }).error,
      }));

    if (errors.length > 0) {
      // If there were errors, send them along with the results
      res.status(207).json({ result, errors });
    } else {
      // If all nodes executed successfully, send the results
      res.json({ result });
    }
  } catch (error) {
    console.error("Error executing workflow:", error);
    res.status(500).json({
      error: "An error occurred while executing the workflow",
      details: (error as Error).message,
    });
  }
});

export default router;
