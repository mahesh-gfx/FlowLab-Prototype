import { BaseNode, NodeDefinition } from "../BaseNode";

export class D3JsNode extends BaseNode {
  constructor(node: Partial<D3JsNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "D3JsNode",
      displayName: "D3.js Visualization",
      description: "Visualizes data using D3.js",
      icon: "chart-bar",
      color: "#4287f5",
      inputs: ["data"],
      outputs: [],
      properties: [
        {
          displayName: "Chart Type",
          name: "chartType",
          type: "options",
          default: "scatter",
          description: "Select the type of chart to display",
          options: [
            { name: "Scatter Plot", value: "scatter" },
            { name: "Line Chart", value: "line" },
            { name: "Bar Chart", value: "bar" },
          ],
        },
        {
          displayName: "X Axis",
          name: "xAxis",
          type: "string",
          default: "",
          description: "The property to use for the X axis",
        },
        {
          displayName: "Y Axis",
          name: "yAxis",
          type: "string",
          default: "",
          description: "The property to use for the Y axis",
        },
      ],
      version: 1,
    };
  }

  getNodeDefinition(): NodeDefinition {
    return D3JsNode.getNodeDefinition();
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    const data = inputs.data.data.json;
    const chartType = this.data.properties?.chartType;
    const xAxis = this.data.properties?.xAxis;
    const yAxis = this.data.properties?.yAxis;

    // Log the input data
    console.log("Input data:", data);

    // Prepare the data for visualization
    const preparedData = data.map((d: any) => ({
      x: d[xAxis],
      y: d[yAxis],
    }));

    return {
      data: {
        json: preparedData,
        chartType,
      },
    };
  }
}
