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
      icon: "FileCsv",
      color: "#4CAF50",
      inputs: ["data"],
      outputs: ["data"],
      properties: [
        {
          displayName: "CSV File",
          name: "csvFile",
          type: "file",
          default: {},
          description: "Upload the CSV file to be read",
        },
      ],
      version: 1,
    };
  }

  getNodeDefinition(): NodeDefinition {
    return ReadCSVNode.getNodeDefinition();
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    const csvFile = this.data.properties?.csvFile;
    if (!csvFile || !csvFile.content) {
      console.error("No CSV file provided");
      throw new Error("No CSV file provided");
    }

    try {
      const base64Content = csvFile.content.split(",")[1] || csvFile.content;
      const csvData = Buffer.from(base64Content, "base64").toString("utf-8");
      const parsedData = Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });

      if (parsedData.errors.length > 0) {
        console.warn("CSV parsing errors:", parsedData.errors);
        throw new Error("CSV parsing errors: Check CSV file");
      }

      return {
        data: {
          json: parsedData.data,
          binary: null,
        },
      };
    } catch (error: any) {
      console.error("Error reading CSV file:", error);
      throw new Error(error.message);
    }
  }
}
