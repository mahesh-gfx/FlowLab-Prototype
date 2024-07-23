import { BaseNode, NodeDefinition } from "../BaseNode";
import { WorkflowNode } from "@data-viz-tool/shared";

export class CSVToJSONNode extends BaseNode {
  constructor(node: Partial<WorkflowNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "CSVToJSONNode",
      displayName: "CSV to JSON",
      description: "Converts CSV data to JSON",
      icon: "exchange-alt",
      color: "#ff6600",
      inputs: ["data"],
      outputs: ["json"],
      properties: [],
      version: 1,
    };
  }

  getNodeDefinition(): NodeDefinition {
    return CSVToJSONNode.getNodeDefinition();
  }

  async execute(inputs: Record<string, any>) {
    const csvData = inputs.data;
    if (!csvData) {
      throw new Error("No CSV data provided");
    }

    // Assuming csvData is already parsed into an array of objects
    const jsonData = JSON.stringify(csvData);
    return { json: jsonData };
  }
}
