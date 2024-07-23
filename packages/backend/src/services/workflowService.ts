import { WorkflowStructure, NodeData } from "@data-viz-tool/shared";
import * as workflowNodes from "@data-viz-tool/nodes";

type NodeInstance = InstanceType<
  (typeof workflowNodes)[keyof typeof workflowNodes]
>;

export class WorkflowService {
  private createNodeInstance(
    node: WorkflowStructure["nodes"][number]
  ): NodeInstance {
    const NodeClass = (workflowNodes as any)[node.type];
    if (typeof NodeClass !== "function") {
      throw new Error(`Unknown node type: ${node.type}`);
    }
    return new NodeClass(node);
  }

  async executeWorkflow(
    workflowData: WorkflowStructure
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    const nodeInstances: Record<string, NodeInstance> = {};

    // Create node instances
    for (const node of workflowData.nodes) {
      try {
        nodeInstances[node.id] = this.createNodeInstance(node);
      } catch (error) {
        console.error(`Error creating node instance for ${node.id}:`, error);
        results[node.id] = {
          error: `Failed to create node instance: ${(error as Error).message}`,
        };
      }
    }

    // Execute nodes in topological order
    const executedNodes = new Set<string>();
    const executeNode = async (nodeId: string) => {
      if (executedNodes.has(nodeId)) return;

      const node = nodeInstances[nodeId];
      if (!node) {
        results[nodeId] = { error: "Node instance not found" };
        executedNodes.add(nodeId);
        return;
      }

      const inputs: Record<string, any> = {};

      // Gather inputs from connected nodes
      for (const edge of workflowData.edges) {
        if (edge.target === nodeId) {
          if (!executedNodes.has(edge.source)) {
            await executeNode(edge.source);
          }
          inputs[edge.targetHandle || "default"] = results[edge.source];
        }
      }

      // Execute the node
      try {
        results[nodeId] = await node.execute(inputs);
        executedNodes.add(nodeId);
      } catch (error) {
        console.error(`Error executing node ${nodeId}:`, error);
        results[nodeId] = {
          error: `Execution failed: ${(error as Error).message}`,
        };
        executedNodes.add(nodeId);
      }
    };

    // Execute all nodes
    for (const nodeId of Object.keys(nodeInstances)) {
      await executeNode(nodeId);
    }

    return results;
  }
}

export const workflowService = new WorkflowService();
