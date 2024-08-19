import { BaseNode, NodeDefinition } from "../BaseNode";

export class NormalizeDataNode extends BaseNode {
  constructor(node: Partial<NormalizeDataNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "NormalizeDataNode",
      displayName: "Normalize Data",
      description: "Normalizes numerical data for analysis",
      icon: "normalize",
      color: "#ECCC12",
      inputs: ["data"],
      outputs: ["normalizedData"],
      properties: [
        {
          displayName: "Normalization Method",
          name: "normalizationMethod",
          type: "string",
          default: "min-max",
          description: "Method to normalize data (min-max, z-score)",
          options: [
            { name: "Min-Max", value: "min-max" },
            { name: "Z-Score", value: "z-score" },
          ],
        },
        {
          displayName: "Columns to Normalize",
          name: "columnsToNormalize",
          type: "string",
          default: "",
          description: "Comma-separated list of columns to normalize",
        },
      ],
      version: 1,
    };
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    const data = inputs.data.data.json;
    const normalizationMethod = this.data?.properties?.normalizationMethod;
    const columnsToNormalize = this.data?.properties?.columnsToNormalize;

    if (!data || !columnsToNormalize) {
      console.error("Invalid input or column specification");
      throw new Error("Invalid input or column specification");
    }

    const columns = columnsToNormalize.split(",").map((col: any) => col.trim());
    const normalizedData = this.normalizeData(
      data,
      columns,
      normalizationMethod
    );

    return {
      data: {
        json: normalizedData,
        binary: null,
      },
    };
  }

  normalizeData(data: any[], columns: string[], method: string): any[] {
    return data.map((row) => {
      const normalizedRow = { ...row };
      columns.forEach((column) => {
        if (row.hasOwnProperty(column)) {
          switch (method) {
            case "min-max":
              normalizedRow[column] = this.minMaxNormalize(
                data,
                column,
                row[column]
              );
              break;
            case "z-score":
              normalizedRow[column] = this.zScoreNormalize(
                data,
                column,
                row[column]
              );
              break;
          }
        }
      });
      return normalizedRow;
    });
  }

  minMaxNormalize(data: any[], column: string, value: number): number {
    const values = data.map((row) => row[column]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return (value - min) / (max - min);
  }

  zScoreNormalize(data: any[], column: string, value: number): number {
    const values = data.map((row) => row[column]);
    const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
    const variance =
      values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);
    return (value - mean) / stdDev;
  }
}
