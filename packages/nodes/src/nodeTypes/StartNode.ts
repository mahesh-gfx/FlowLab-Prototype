import { BaseNode, NodeDefinition } from "../BaseNode";
import { WorkflowNode } from "@data-viz-tool/shared";

export class StartNode extends BaseNode {
  constructor(node: Partial<WorkflowNode>) {
    super(node);
    console.log("Start node instance created...");
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "StartNode",
      displayName: "Start",
      description: "Marks the start of a workflow",
      icon: "play-circle",
      color: "#00ff00",
      inputs: [],
      outputs: ["main"],
      properties: [
        {
          displayName: "Workflow Name",
          name: "workflowName",
          type: "string",
          default: "Untitled workflow",
          description: "Enter a name for this workflow",
        },
        {
          displayName: "Description",
          name: "description",
          type: "text",
          default: "Describe your workflow",
          description: "Describe the purpose of this workflow",
        },
      ],
      version: 1,
    };
  }

  getNodeDefinition(): NodeDefinition {
    return StartNode.getNodeDefinition();
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    console.log("Executing Start Node...");
    return {
      data: {
        json: {
          message: "Workflow started",
          workflowName: this.data.workflowName,
          description: this.data.description,
        },
        binary: null,
      },
    };
  }
}
