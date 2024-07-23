import { BaseNode, NodeDefinition } from "../BaseNode";
import { WorkflowNode } from "@data-viz-tool/shared";

export class InputNode extends BaseNode {
  constructor(node: Partial<WorkflowNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "inputNode",
      displayName: "Input",
      description: "Reads input data for the workflow",
      icon: "file-import",
      color: "#0000ff",
      inputs: [],
      outputs: ["data"],
      properties: [
        {
          displayName: "Input Type",
          name: "inputType",
          type: "options",
          options: [
            { name: "CSV", value: "csv" },
            { name: "JSON", value: "json" },
            { name: "XML", value: "xml" },
          ],
          default: "csv",
          description: "Select the type of input data",
        },
        {
          displayName: "Data Source",
          name: "dataSource",
          type: "string",
          default: "",
          description:
            "Enter the source of the input data (e.g., file path, URL)",
        },
        {
          displayName: "Has Headers",
          name: "hasHeaders",
          type: "boolean",
          default: true,
          description: "Does the input data have headers?",
          displayOptions: {
            show: {
              inputType: ["csv"],
            },
          },
        },
      ],
      version: 1,
    };
  }

  getNodeDefinition(): NodeDefinition {
    return InputNode.getNodeDefinition();
  }

  async execute(inputs: Record<string, any>) {
    const { inputType, dataSource, hasHeaders } = this.data;
    console.log(`Fetching ${inputType} data from ${dataSource}`);

    // This is a placeholder. In a real scenario, you'd implement actual data fetching logic here.
    const simulatedData = {
      csv: "id,name,value\n1,Item1,100\n2,Item2,200",
      json: JSON.stringify([
        { id: 1, name: "Item1", value: 100 },
        { id: 2, name: "Item2", value: 200 },
      ]),
      xml: "<data><item><id>1</id><name>Item1</name><value>100</value></item><item><id>2</id><name>Item2</name><value>200</value></item></data>",
    };

    return {
      data:
        simulatedData[inputType as keyof typeof simulatedData] ||
        "No data available",
    };
  }
}
