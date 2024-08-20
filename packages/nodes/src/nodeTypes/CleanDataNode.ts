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
          type: "options",
          default: "mean",
          description: "Strategy to handle missing values (mean, median, drop)",
          options: [
            { name: "Mean", value: "mean" },
            { name: "Median", value: "median" },
            { name: "Drop", value: "drop" },
          ],
        },
        {
          displayName: "Transform Data Types",
          name: "transformDataTypes",
          type: "list",
          default: [],
          description: "List of data type transformations",
          itemType: {
            type: "object",
            properties: [
              {
                displayName: "Column",
                name: "column",
                type: "string",
                default: "",
                description: "The column to transform",
              },
              {
                displayName: "Target Type",
                name: "targetType",
                type: "options",
                description: "The target data type",
                options: [
                  { name: "Number", value: "number" },
                  { name: "Boolean", value: "boolean" },
                  { name: "Date", value: "date" },
                ],
              },
            ],
          },
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
    if (this.data.properties?.transformDataTypes.length > 0) {
      data = this.transformDataTypes(
        data,
        this.data.properties?.transformDataTypes
      );
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
    if (strategy === "drop") {
      // Remove rows with any null or undefined vfexecutealues
      return data.filter((row) => {
        return Object.values(row).every(
          (value) => value !== null && value !== undefined
        );
      });
    }

    // Calculate max decimal places for each column
    const maxDecimals = this.calculateMaxDecimals(data);

    // For other strategies, modify the data in place
    return data.map((row) => {
      for (let key in row) {
        if (row[key] === null || row[key] === undefined) {
          let calculatedValue;
          switch (strategy) {
            case "mean":
              calculatedValue = this.calculateMean(data, key);
              break;
            case "median":
              calculatedValue = this.calculateMedian(data, key);
              break;
          }
          // Format the calculated value to match the max decimal places
          if (calculatedValue !== undefined) {
            row[key] = parseFloat(calculatedValue.toFixed(maxDecimals[key]));
          }
        }
      }
      return row;
    });
  }

  calculateMaxDecimals(data: any[]): Record<string, number> {
    const maxDecimals: Record<string, number> = {};
    data.forEach((row) => {
      for (let key in row) {
        const value = row[key];
        if (typeof value === "number" && !isNaN(value)) {
          const decimals = this.getDecimalPlaces(value);
          if (!maxDecimals[key] || decimals > maxDecimals[key]) {
            maxDecimals[key] = decimals;
          }
        }
      }
    });
    return maxDecimals;
  }

  getDecimalPlaces(value: number): number {
    const valueString = value.toString();
    const decimalIndex = valueString.indexOf(".");
    return decimalIndex === -1 ? 0 : valueString.length - decimalIndex - 1;
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

  transformDataTypes(data: any[], transformations: any[]): any[] {
    return data.map((row) => {
      transformations.forEach(({ column, targetType }) => {
        if (row.hasOwnProperty(column)) {
          const value = row[column];
          switch (targetType) {
            case "number":
              row[column] = parseFloat(value);
              break;
            case "boolean":
              row[column] = value.toLowerCase() === "true";
              break;
            case "date":
              row[column] = new Date(value);
              break;
          }
        }
      });
      return row;
    });
  }
}
