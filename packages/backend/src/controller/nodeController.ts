import { Request, Response } from "express";
import { WorkflowNode, WorkflowStructure } from "@data-viz-tool/shared";
import { executeNodeHook } from "../services/nodeService";

export const executeNode = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    node,
    workflow,
  }: { node: WorkflowNode; workflow: WorkflowStructure } = req.body;
  try {
    const output = await executeNodeHook(node, workflow);
    res.json(output);
  } catch (error) {
    res.status(500).json({ error: "Error executing node" });
  }
};
