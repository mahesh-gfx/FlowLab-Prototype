import { EventEmitter } from "events";
import { WorkflowStructure, WorkflowNode } from "@data-viz-tool/shared";
import * as workflowNodes from "@data-viz-tool/nodes";
import { Workflow } from "../entity/Workflow";
import { User } from "../entity/User";
import { Node } from "../entity/Node";
import { Edge } from "../entity/Edge";
import { AppDataSource } from "../data-source";

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

  async saveWorkflow(
    workflowName: string,
    description: string,
    userId: number,
    nodes: Array<any>,
    edges: Array<any>
  ) {
    console.log("Saving workflow...");

    try {
      const userRepository = AppDataSource.getRepository(User);
      const workflowRepository = AppDataSource.getRepository(Workflow);
      const nodeRepository = AppDataSource.getRepository(Node);
      const edgeRepository = AppDataSource.getRepository(Edge);

      const user = await userRepository.findOneBy({ id: userId });
      if (!user) {
        // return res.status(404).json({ message: "User not found" });
        throw Error("Error saving workflow: No user found!");
      }

      const workflow = new Workflow();
      workflow.name = workflowName || "Untitled Workflow";
      workflow.description = description || "";
      workflow.user = user;

      // Save workflow to get an ID for nodes and edges
      const response = await workflowRepository.save(workflow);

      // Save nodes excluding output properties
      const nodeEntities = nodes.map((nodeData: any) => {
        const node = new Node();
        node.nodeId = nodeData.id;
        node.type = nodeData.type;
        node.positionX = nodeData.position.x;
        node.positionY = nodeData.position.y;
        node.label = nodeData.data.label;
        node.properties = nodeData.data.properties;
        node.workflow = workflow;
        return node;
      });

      await nodeRepository.save(nodeEntities);

      // Save edges
      const edgeEntities = edges.map((edgeData: any) => {
        const edge = new Edge();
        edge.source = edgeData.source;
        edge.sourceHandle = edgeData.sourceHandle;
        edge.target = edgeData.target;
        edge.targetHandle = edgeData.targetHandle;
        edge.workflow = workflow;
        return edge;
      });

      await edgeRepository.save(edgeEntities);
      return response;
    } catch (error) {
      console.error(error);
      // res.status(500).json({ message: "Internal server error" });
    }
  }

  async getWorkflowsByUser(userId: number): Promise<{
    data: { status: number; message?: string; workflows?: Array<any> };
  }> {
    console.log("Getting workflows for ", userId);
    try {
      const workflowRepository = AppDataSource.getRepository(Workflow);
      const workflows = await workflowRepository
        .createQueryBuilder("workflow")
        .select([
          "workflow.id",
          "workflow.name",
          "workflow.description",
          "workflow.createdAt",
          "workflow.updatedAt",
        ])
        .where("workflow.userId = :userId", { userId })
        .orderBy("workflow.updatedAt", "DESC")
        .getMany();

      if (!workflows.length) {
        return {
          data: { status: 200, message: "No workflows found for this user!" },
        };
      } else {
        return {
          data: { status: 200, workflows },
        };
      }
    } catch (error) {
      console.error(error);
      return {
        data: { status: 500, message: "Internal server error!" },
      };
    }
  }
  async getWorkflowByIdAndUserId(userId: number | string, workflowId: string) {
    const user = parseInt(userId as string, 10);

    try {
      const workflowRepository = AppDataSource.getRepository(Workflow);
      const workflow = await workflowRepository.findOne({
        where: { id: workflowId, user: { id: user } },
        relations: ["nodes", "edges"],
      });

      if (!workflow) {
        return {
          data: {
            status: 404,
            message: `No workflow found with the id ${workflowId}!`,
          },
        };
      } else {
        // Transform nodes and edges to the desired structure
        const nodes = workflow.nodes.map((node) => ({
          id: node.nodeId,
          type: node.type,
          position: {
            x: node.positionX,
            y: node.positionY,
          },
          data: {
            label: node.label,
            type: node.type,
            properties: node.properties,
          },
          width: node.width,
          height: node.height,
          positionAbsolute: {
            x: node.positionAbsolute.x,
            y: node.positionAbsolute.y,
          },
          selected: node.selected,
          dragging: node.dragging,
        }));

        const edges = workflow.edges.map((edge) => ({
          source: edge.source,
          sourceHandle: edge.sourceHandle,
          target: edge.target,
          targetHandle: edge.targetHandle,
          id: edge.id,
        }));

        return {
          data: {
            status: 200,
            workflow: {
              id: workflow.id,
              name: workflow.name,
              description: workflow.description,
              createdAt: workflow.createdAt,
              updatedAt: workflow.updatedAt,
              nodes,
              edges,
            },
          },
        };
      }
    } catch (error) {
      console.error(error);
      return {
        data: { status: 500, message: "Internal server error!" },
      };
    }
  }

  async deleteWorkflowById(workflowId: string, userId: number | string) {
    const user = parseInt(userId as string, 10);
    try {
      const workflowRepository = AppDataSource.getRepository(Workflow);
      const nodeRepository = AppDataSource.getRepository(Node);
      const edgeRepository = AppDataSource.getRepository(Edge);

      const workflow = await workflowRepository.findOne({
        where: { id: workflowId, user: { id: user } },
        relations: ["nodes", "edges"],
      });

      if (!workflow) {
        return {
          data: {
            status: 404,
            message: `No workflow found with the id ${workflowId} to delete!`,
          },
        };
      }

      // Delete related nodes and edges
      await nodeRepository.remove(workflow.nodes);
      await edgeRepository.remove(workflow.edges);

      // Delete the workflow
      await workflowRepository.remove(workflow);

      return {
        data: {
          status: 200,
          message: `Workflow with id ${workflowId} has been deleted successfully!`,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        data: { status: 500, message: "Internal server error!" },
      };
    }
  }
}
