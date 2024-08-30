import { BaseNode, NodeDefinition } from "../BaseNode";

export class CorrelationHeatmapNode extends BaseNode {
  constructor(node: Partial<CorrelationHeatmapNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "CorrelationHeatmapNode",
      displayName: "Correlation Heatmap",
      description: "Visualizes correlations between variables using a heatmap",
      icon: "CorrelationHeatmap",
      color: "#89023E",
      inputs: ["data"],
      outputs: ["data"],
      properties: [
        {
          displayName: "Variables",
          name: "variables",
          type: "string",
          default: "",
          description:
            "Comma-separated list of variables to include in the correlation matrix",
        },
      ],
      version: 1,
    };
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    const data = inputs.data.data.json;
    const variablesInput = this.data.properties?.variables;

    if (!data || !variablesInput) {
      console.error("Invalid input or variable specification");
      throw new Error("Invalid input or variable specification");
    }

    const variables = variablesInput
      .split(",")
      .map((v: any) => v.trim())
      .filter((v: any) => v);

    if (variables.length === 0) {
      console.error("No variables selected");
      throw new Error("No variables selected");
    }

    // Calculate correlation coefficients
    const correlationData = this.calculateCorrelationMatrix(data, variables);

    return {
      data: {
        json: correlationData,
        binary: null,
      },
    };
  }

  calculateCorrelationMatrix(data: any[], variables: string[]): any[] {
    const matrix = [];
    for (let i = 0; i < variables.length; i++) {
      for (let j = 0; j < variables.length; j++) {
        const x = variables[i];
        const y = variables[j];
        const correlation = this.calculateCorrelation(data, x, y);
        matrix.push({ x, y, correlation });
      }
    }
    return matrix;
  }

  calculateCorrelation(data: any[], xVar: string, yVar: string): number {
    const xValues = data.map((row) => +row[xVar]);
    const yValues = data.map((row) => +row[yVar]);
    const n = xValues.length;
    const xMean = xValues.reduce((sum, val) => sum + val, 0) / n;
    const yMean = yValues.reduce((sum, val) => sum + val, 0) / n;
    const covariance =
      xValues.reduce(
        (sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean),
        0
      ) / n;
    const xStdDev = Math.sqrt(
      xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0) / n
    );
    const yStdDev = Math.sqrt(
      yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0) / n
    );
    return covariance / (xStdDev * yStdDev);
  }
}
