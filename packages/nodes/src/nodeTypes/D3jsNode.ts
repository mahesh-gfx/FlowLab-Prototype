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
      outputs: ["data"],
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
        {
          displayName: "Category",
          name: "category",
          type: "string",
          default: "",
          description:
            "The property to use for the color label / category label, usually the last column in the dataset",
        },
      ],
      version: 1,
    };
  }

  getNodeDefinition(): NodeDefinition {
    return D3JsNode.getNodeDefinition();
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    const { reducedData, originalData } = inputs.data.data.json;

    // Log the input data
    console.log("Input data:", reducedData);

    // Prepare the data for visualization
    const preparedData = reducedData.map((d: any, index: number) => ({
      ...reducedData[index],
      ...originalData[index], // Merge properties from originalData at the same index
    }));

    // const uniqueLabels = [
    //   ...new Set(preparedData.map((item: any) => item[category])),
    // ];

    return {
      data: {
        json: { chartData: preparedData },
      },
    };
  }
}
