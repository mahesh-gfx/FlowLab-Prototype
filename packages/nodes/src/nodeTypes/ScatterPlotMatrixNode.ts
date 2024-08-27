import { BaseNode, NodeDefinition } from "../BaseNode";

export class ScatterPlotMatrixNode extends BaseNode {
  constructor(node: Partial<ScatterPlotMatrixNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "ScatterPlotMatrixNode",
      displayName: "Scatter Plot Matrix",
      description:
        "Visualizes relationships between multiple variables using a scatter plot matrix",
      icon: "scatter-matrix",
      color: "#92589D",
      inputs: ["data"],
      outputs: ["plotData"],
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
          displayName: "Show Diagonal",
          name: "showDiagonal",
          type: "boolean",
          default: true,
          description: "Display histograms or density plots on the diagonal",
        },
        {
          displayName: "Color By",
          name: "colorBy",
          type: "string",
          default: "",
          description: "Variable to use for color coding points",
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

    // Prepare data for scatter plot matrix
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
