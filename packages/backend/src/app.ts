import express from "express";
import cors from "cors";
import { executeWorkflowWithValidation } from "./services/workflowService";
import { WorkflowStructure } from "@data-viz-tool/shared";
import { getNodeTypes, getNodeConfig } from "./services/nodeService";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post("/api/execute-workflow", async (req, res) => {
  try {
    const workflow: WorkflowStructure = req.body;
    const result = await executeWorkflowWithValidation(workflow);
    res.json(result);
  } catch (error) {
    console.error("Error executing workflow:", error);
    res.status(500).json({ error: "Workflow execution failed" });
  }
});

app.get("/api/node-types", (req, res) => {
  try {
    const nodeTypes = getNodeTypes();
    res.json(nodeTypes);
  } catch (error) {
    console.error("Error fetching node types:", error);
    res.status(500).json({ error: "Failed to fetch node types" });
  }
});

app.get("/api/node-config/:type", (req, res) => {
  try {
    const nodeType = req.params.type;
    const config = getNodeConfig(nodeType);
    res.json(config);
  } catch (error) {
    console.error("Error fetching node config:", error);
    res.status(500).json({ error: "Failed to fetch node config" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
