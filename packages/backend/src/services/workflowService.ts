import { WorkflowStructure, NodeOutput } from "@data-viz-tool/shared";
import { executeNodeHook } from "./nodeService";

export const executeWorkflow = async (
  workflow: WorkflowStructure
): Promise<Record<string, NodeOutput>> => {
  const results: Record<string, NodeOutput> = {};
  for (const node of workflow.nodes) {
    results[node.id] = await executeNodeHook(node, workflow);
  }
  return results;
};
