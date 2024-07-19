import {
  WorkflowNode,
  WorkflowStructure,
  NodeOutput,
} from "@data-viz-tool/shared";

const nodeHooks: Record<
  string,
  (node: WorkflowNode, workflow: WorkflowStructure) => Promise<NodeOutput>
> = {
  csvInput: async (node) => {
    // Implement CSV input logic
    return { data: { json: [], binary: [] }, parameters: {} };
  },
  dataFilter: async (node, workflow) => {
    // Implement data filter logic
    return { data: { json: [], binary: [] }, parameters: {} };
  },
  scatterPlot: async (node, workflow) => {
    // Implement scatter plot logic
    return { data: { json: [], binary: [] }, parameters: {} };
  },
};

export const executeNodeHook = async (
  node: WorkflowNode,
  workflow: WorkflowStructure
): Promise<NodeOutput> => {
  const hook = nodeHooks[node.type];
  if (!hook) {
    throw new Error(`No hook found for node type: ${node.type}`);
  }
  return hook(node, workflow);
};
