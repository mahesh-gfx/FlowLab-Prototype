import { BaseNode, NodeDefinition } from "../BaseNode";
import { WorkflowNode } from "@data-viz-tool/shared";
import Papa from "papaparse";

export class ReadCSVNode extends BaseNode {
  constructor(node: Partial<WorkflowNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "ReadCSVNode",
      displayName: "Read CSV File",
      description: "Reads CSV file for the workflow",
      icon: "file-csv",
      color: "#4CAF50",
      inputs: ["data"],
      outputs: ["data"],
      properties: [
        {
          displayName: "CSV File",
          name: "dataSource",
          type: "file",
          default: null,
          description: "Upload the CSV file to be read",
        },
      ],
      version: 1,
    };
  }

  getNodeDefinition(): NodeDefinition {
    return ReadCSVNode.getNodeDefinition();
  }

  async execute(inputs: Record<string, any>) {
    const { dataSource } = this.data;

    if (!dataSource) {
      throw new Error("No CSV file provided");
    }

    try {
      const csvData = await this.readFile(dataSource);
      const parsedData = Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });

      if (parsedData.errors.length > 0) {
        console.warn("CSV parsing errors:", parsedData.errors);
      }

      return { data: parsedData.data };
    } catch (error) {
      console.error("Error reading CSV file:", error);
      throw new Error("Failed to read CSV file");
    }
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
