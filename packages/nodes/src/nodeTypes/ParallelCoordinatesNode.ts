import { BaseNode, NodeDefinition } from "../BaseNode";

export class ParallelCoordinatesNode extends BaseNode {
  constructor(node: Partial<ParallelCoordinatesNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "ParallelCoordinatesNode",
      displayName: "Parallel Coordinates",
      description:
        "Visualizes high-dimensional data using parallel coordinates",
      icon: "parallel-coordinates",
      color: "#BCFA1F",
      inputs: ["data"],
      outputs: ["data"],
      properties: [
        {
          displayName: "Variables",
          name: "variables",
          type: "string",
          default: "",
          description:
            "Comma-separated list of variables to include, or leave empty to include all",
        },
        {
          displayName: "Color By",
          name: "colorBy",
          type: "string",
          default: "",
          description: "Variable to use for color coding lines",
        },
      ],
      version: 1,
    };
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    const data = inputs.data.data.json;
    const variablesInput = this.data.properties?.variables;
    const colorBy = this.data.properties?.colorBy;

    if (!data) {
      console.error("Invalid input data");
      throw new Error("Invalid input data");
    }

    // Determine variables to use
    const variables = variablesInput
      ? variablesInput
          .split(",")
          .map((v: any) => v.trim())
          .filter((v: any) => v)
      : Object.keys(data[0]);

    if (variables.length === 0) {
      console.error("No variables selected");
      throw new Error("No variables selected");
    }

    // Prepare data for parallel coordinates
    const plotData = data.map((row: any) => {
      const selectedVariables = variables.reduce((acc: any, variable: any) => {
        acc[variable] = row[variable];
        return acc;
      }, {});

      if (colorBy) {
        selectedVariables[colorBy] = row[colorBy];
      }

      return selectedVariables;
    });

    return {
      data: {
        json: plotData,
        binary: null,
      },
    };
  }
}
