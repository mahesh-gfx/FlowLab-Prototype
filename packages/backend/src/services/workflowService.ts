import { EventEmitter } from "events";
import { WorkflowStructure, WorkflowNode } from "@data-viz-tool/shared";
import * as workflowNodes from "@data-viz-tool/nodes";

type NodeInstance = InstanceType<
  (typeof workflowNodes)[keyof typeof workflowNodes]
>;

export class WorkflowService extends EventEmitter {
  private createNodeInstance(node: WorkflowNode): NodeInstance {
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

    console.log("WorkflowData: ", workflowData);

    // Create node instances
    for (const node of workflowData.nodes) {
      try {
        nodeInstances[node.id] = this.createNodeInstance(node);
      } catch (error) {
        console.error(`Error creating node instance for ${node.id}:`, error);
        results[node.id] = {
          error: `Failed to create node instance: ${(error as Error).message}`,
        };
        this.emit("nodeError", {
          nodeId: node.id,
          error: results[node.id].error,
        });
        return results; // Stop execution if there's an error creating a node instance
      }
    }

    // Execute nodes in topological order
    const executedNodes = new Set<string>();
    const executeNode = async (nodeId: string): Promise<boolean> => {
      if (executedNodes.has(nodeId)) return true;

      const node = nodeInstances[nodeId];
      if (!node) {
        results[nodeId] = { error: "Node instance not found" };
        executedNodes.add(nodeId);
        this.emit("nodeError", { nodeId, error: results[nodeId].error });
        return false;
      }

      const inputs: Record<string, any> = {};

      // Gather inputs from connected nodes
      for (const edge of workflowData.edges) {
        if (edge.target === nodeId) {
          if (!executedNodes.has(edge.source)) {
            const success = await executeNode(edge.source);
            if (!success) return false; // Stop if a previous node failed
          }
          inputs[edge.targetHandle || "default"] = results[edge.source];
        }
      }

      // Execute the node
      try {
        console.log(`Executing Node: ${nodeId}`);
        const output = await node.execute(inputs);
        results[nodeId] = output;
        node.output = output;
        executedNodes.add(nodeId);
        console.log(`Emitting nodeExecuted event for ${nodeId}`);
        this.emit("nodeExecuted", { nodeId, output });
        return true;
      } catch (error) {
        console.error(`Error executing node ${nodeId}:`, error);
        results[nodeId] = {
          error: `Execution failed: ${(error as Error).message}`,
        };
        console.log(`Emitting nodeError event for ${nodeId}`);
        this.emit("nodeError", { nodeId, error: results[nodeId].error });
        executedNodes.add(nodeId);
        return false;
      }
    };

    // Execute all nodes
    for (const nodeId of Object.keys(nodeInstances)) {
      const success = await executeNode(nodeId);
      if (!success) {
        this.emit("workflowCompletedWithErrors");
        return results; // Stop execution if any node fails
      }
    }

    console.log("Emitting workflowCompleted event");
    this.emit("workflowCompleted");
    return results;
  }
}
