import { BaseNode, NodeDefinition } from "../BaseNode";

export class CleanDataNode extends BaseNode {
  constructor(node: Partial<CleanDataNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "CleanDataNode",
      displayName: "Clean Data",
      description: "Cleans data for information visualization",
      icon: "clean-data",
      color: "#FF9800",
      inputs: ["data"],
      outputs: ["data"],
      properties: [
        {
          displayName: "Remove Duplicates",
          name: "removeDuplicates",
          type: "boolean",
          default: true,
          description: "Remove duplicate rows from the data",
        },
        {
          displayName: "Handle Missing Values",
          name: "handleMissingValues",
          type: "string",
          default: "mean",
          description: "Strategy to handle missing values (mean, median, drop)",
        },
        {
          displayName: "Transform Data Types",
          name: "transformDataTypes",
          type: "boolean",
          default: true,
          description: "Automatically transform data types",
        },
      ],
      version: 1,
    };
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    let data = inputs.data.data.json;

    if (!data) {
      console.error("No data provided");
      throw new Error("No data provided");
    }

    // Remove duplicates if enabled
    if (this.data.properties?.removeDuplicates) {
      data = this.removeDuplicates(data);
    }

    // Handle missing values
    if (this.data.properties?.handleMissingValues) {
      const strategy = this.data.properties.handleMissingValues;
      data = this.handleMissingValues(data, strategy);
    }

    // Transform data types if enabled
    if (this.data.properties?.transformDataTypes) {
      data = this.transformDataTypes(data);
    }

    return {
      data: {
        json: data,
        binary: null,
      },
    };
  }

  removeDuplicates(data: any[]): any[] {
    return data.filter(
      (value, index, self) =>
        index ===
        self.findIndex((t) => JSON.stringify(t) === JSON.stringify(value))
    );
  }

  handleMissingValues(data: any[], strategy: string): any[] {
    // Example implementation for handling missing values
    return data.map((row) => {
      for (let key in row) {
        if (row[key] === null || row[key] === undefined) {
          switch (strategy) {
            case "mean":
              row[key] = this.calculateMean(data, key);
              break;
            case "median":
              row[key] = this.calculateMedian(data, key);
              break;
            case "drop":
              delete row[key];
              break;
          }
        }
      }
      return row;
    });
  }

  calculateMean(data: any[], key: string): number {
    const validValues = data
      .map((row) => row[key])
      .filter((value) => value !== null && value !== undefined);
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return sum / validValues.length;
  }

  calculateMedian(data: any[], key: string): number {
    const validValues = data
      .map((row) => row[key])
      .filter((value) => value !== null && value !== undefined)
      .sort((a, b) => a - b);
    const mid = Math.floor(validValues.length / 2);
    return validValues.length % 2 !== 0
      ? validValues[mid]
      : (validValues[mid - 1] + validValues[mid]) / 2;
  }

  transformDataTypes(data: any[]): any[] {
    // Example implementation for transforming data types
    return data.map((row) => {
      for (let key in row) {
        if (!isNaN(row[key])) {
          row[key] = parseFloat(row[key]);
        }
      }
      return row;
    });
  }
}
