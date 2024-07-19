import { Request, Response } from "express";
import { WorkflowStructure } from "@data-viz-tool/shared";
import { executeWorkflow } from "../services/workflowService";

export const runWorkflow = async (req: Request, res: Response) => {
  const workflow: WorkflowStructure = req.body;
  try {
    const results = await executeWorkflow(workflow);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Error executing workflow" });
  }
};
