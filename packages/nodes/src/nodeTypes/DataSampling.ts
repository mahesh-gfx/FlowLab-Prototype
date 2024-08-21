import { BaseNode, NodeDefinition } from "../BaseNode";

export class DataSamplingNode extends BaseNode {
  constructor(node: Partial<DataSamplingNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "DataSamplingNode",
      displayName: "Data Sampling",
      description:
        "Selects a representative subset of data points from a larger dataset",
      icon: "sampling",
      color: "#132793",
      inputs: ["data"],
      outputs: ["data"],
      properties: [
        {
          displayName: "Sampling Method",
          name: "samplingMethod",
          type: "options",
          default: "simpleRandom",
          description: "Choose the sampling method",
          options: [
            { name: "Simple Random", value: "simpleRandom" },
            { name: "Stratified", value: "stratified" },
            { name: "Cluster", value: "cluster" },
            { name: "Systematic", value: "systematic" },
            { name: "Convenience", value: "convenience" },
            { name: "Purposive", value: "purposive" },
          ],
        },
        {
          displayName: "Sample Size",
          name: "sampleSize",
          type: "number",
          default: 100,
          description: "Number of data points to sample",
        },
        {
          displayName: "Strata Column",
          name: "strataColumn",
          type: "string",
          default: "",
          description: "Column to use for stratified sampling",
          displayOptions: {
            show: {
              samplingMethod: ["stratified"],
            },
          },
        },
        {
          displayName: "Cluster Column",
          name: "clusterColumn",
          type: "string",
          default: "",
          description: "Column to use for cluster sampling",
          displayOptions: {
            show: {
              samplingMethod: ["cluster"],
            },
          },
        },
      ],
      version: 1,
    };
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    const data = inputs.data.data.json;
    const samplingMethod = this.data.properties?.samplingMethod;
    const sampleSize = this.data.properties?.sampleSize;
    const strataColumn = this.data.properties?.strataColumn;
    const clusterColumn = this.data.properties?.clusterColumn;

    if (!data) {
      console.error("No data provided");
      throw new Error("No data provided");
    }

    let sampledData;
    switch (samplingMethod) {
      case "simpleRandom":
        sampledData = this.simpleRandomSampling(data, sampleSize);
        break;
      case "stratified":
        if (!strataColumn) {
          throw new Error(
            "Strata column must be specified for stratified sampling"
          );
        }
        sampledData = this.stratifiedSampling(data, sampleSize, strataColumn);
        break;
      case "cluster":
        if (!clusterColumn) {
          throw new Error(
            "Cluster column must be specified for cluster sampling"
          );
        }
        sampledData = this.clusterSampling(data, sampleSize, clusterColumn);
        break;
      case "systematic":
        sampledData = this.systematicSampling(data, sampleSize);
        break;
      case "convenience":
        sampledData = this.convenienceSampling(data, sampleSize);
        break;
      case "purposive":
        sampledData = this.purposiveSampling(data, sampleSize);
        break;
      default:
        throw new Error("Invalid sampling method");
    }

    console.log("Sampled Data: ", sampledData);

    return {
      data: {
        json: sampledData,
        binary: null,
      },
    };
  }

  simpleRandomSampling(data: any[], sampleSize: number): Array<any> {
    const shuffled = data.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  }

  stratifiedSampling(
    data: any[],
    sampleSize: number,
    strataColumn: string
  ): any[] {
    const strata = data.reduce((acc, row) => {
      const key = row[strataColumn];
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});

    const sampledData: any = [];
    const strataKeys = Object.keys(strata);
    const sampleSizePerStratum = Math.floor(sampleSize / strataKeys.length);

    strataKeys.forEach((key) => {
      const stratum = strata[key];
      const sampledStratum = this.simpleRandomSampling(
        stratum,
        sampleSizePerStratum
      );
      sampledData.push(...sampledStratum);
    });

    return sampledData;
  }

  clusterSampling(
    data: any[],
    sampleSize: number,
    clusterColumn: string
  ): any[] {
    const clusters = data.reduce((acc, row) => {
      const key = row[clusterColumn];
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});

    const clusterKeys = Object.keys(clusters);
    const sampledClusterKeys = this.simpleRandomSampling(
      clusterKeys,
      sampleSize
    );

    // Use map and reduce to flatten the array
    const sampledData = sampledClusterKeys
      .map((key) => clusters[key])
      .reduce((acc, val) => acc.concat(val), []);

    return sampledData;
  }

  systematicSampling(data: any[], sampleSize: number): any[] {
    const interval = Math.floor(data.length / sampleSize);
    const start = Math.floor(Math.random() * interval);
    return data
      .filter((_, index) => (index - start) % interval === 0)
      .slice(0, sampleSize);
  }

  convenienceSampling(data: any[], sampleSize: number): any[] {
    return data.slice(0, sampleSize);
  }

  purposiveSampling(data: any[], sampleSize: number): any[] {
    // Placeholder for purposive sampling logic
    // Implement based on specific criteria or expert judgment
    return data.slice(0, sampleSize);
  }
}
