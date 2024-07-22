import { BaseNode } from "../BaseNode";
import { WorkflowNode } from "@data-viz-tool/shared";

export class InputNode extends BaseNode {
  constructor(node: WorkflowNode) {
    super(node);
  }

  getFrontendConfig() {
    return {
      label: "Input Node",
      color: "#0000ff",
      inputs: [],
      outputs: ["data"],
      configOptions: {
        dataSource: { type: "string", label: "Data Source" },
        format: {
          type: "select",
          label: "Data Format",
          options: ["CSV", "JSON", "XML"],
        },
      },
    };
  }

  async execute(inputs: Record<string, any>) {
    // Simulating data fetching
    const simulatedData = this.simulateFetchData(
      this.data.dataSource,
      this.data.format
    );
    return { data: simulatedData };
  }

  private simulateFetchData(dataSource: string, format: string): any {
    // This is a placeholder function to simulate data fetching
    // replace this with actual data fetching logic
    console.log(`Fetching data from ${dataSource} in ${format} format`);

    // Simulated data
    const sampleData = {
      CSV: "id,name,value\n1,Item1,100\n2,Item2,200",
      JSON: JSON.stringify([
        { id: 1, name: "Item1", value: 100 },
        { id: 2, name: "Item2", value: 200 },
      ]),
      XML: "<data><item><id>1</id><name>Item1</name><value>100</value></item><item><id>2</id><name>Item2</name><value>200</value></item></data>",
    };

    return sampleData[format as keyof typeof sampleData] || "No data available";
  }
}
