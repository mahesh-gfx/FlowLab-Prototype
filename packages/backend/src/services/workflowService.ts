import { WorkflowStructure, NodeOutput } from "@data-viz-tool/shared";
import { executeNodeHook } from "./nodeService";

export const validateWorkflow = (workflow: WorkflowStructure): boolean => {
  // Todo: Implement workflow validation logic
  // For example, check if all node types are valid, if edges connect existing nodes, etc.
  return true; // Placeholder
};

export const executeWorkflow = async (
  workflow: WorkflowStructure
): Promise<Record<string, NodeOutput>> => {
  const results: Record<string, NodeOutput> = {};
  for (const node of workflow.nodes) {
    results[node.id] = await executeNodeHook(node, workflow);
  }
  return results;
};

export const executeWorkflowWithValidation = async (
  workflow: WorkflowStructure
) => {
  if (!validateWorkflow(workflow)) {
    throw new Error("Invalid workflow structure");
  }

  return await executeWorkflow(workflow);
};
