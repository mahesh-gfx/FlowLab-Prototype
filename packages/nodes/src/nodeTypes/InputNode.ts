import { BaseNode, NodeDefinition } from "../BaseNode";
import { WorkflowNode } from "@data-viz-tool/shared";
import Papa from "papaparse";

export class InputNode extends BaseNode {
  constructor(node: Partial<WorkflowNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "InputNode",
      displayName: "Input",
      description: "Reads input data for the workflow",
      icon: "FileImport",
      color: "#0000ff",
      inputs: ["data"],
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
          type: "file",
          default: "",
          description: "Upload the input data file",
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

    if (inputType === "csv" && dataSource) {
      const csvData = await this.readFile(dataSource);
      const parsedData = Papa.parse(csvData, {
        header: hasHeaders,
        dynamicTyping: true,
      });
      return { data: parsedData.data };
    }

    // Placeholder for other input types
    return {
      data: {
        json: { message: "No data available" },
      },
    };
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}
