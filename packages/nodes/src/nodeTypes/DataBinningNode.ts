import { BaseNode, NodeDefinition } from "../BaseNode";

export class DataBinningNode extends BaseNode {
  constructor(node: Partial<DataBinningNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "DataBinningNode",
      displayName: "Data Binning",
      description: "Groups continuous data into discrete intervals or bins",
      icon: "bin",
      color: "#00A971",
      inputs: ["data"],
      outputs: ["binnedData"],
      properties: [
        {
          displayName: "Binning Method",
          name: "binningMethod",
          type: "options",
          default: "equal-width",
          description: "Method to use for binning",
          options: [
            { name: "Equal Width", value: "equal-width" },
            { name: "Equal Frequency", value: "equal-frequency" },
            { name: "Custom", value: "custom" },
          ],
        },
        {
          displayName: "Number of Bins",
          name: "numberOfBins",
          type: "number",
          default: 10,
          description: "Number of bins to create",
        },
        {
          displayName: "Custom Bin Edges",
          name: "customBinEdges",
          type: "string",
          default: "",
          description: "Comma-separated list of custom bin edges",
        },
        {
          displayName: "Column to Bin",
          name: "columnToBin",
          type: "string",
          default: "",
          description: "The column to apply binning on",
        },
      ],
      version: 1,
    };
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    const data = inputs.data.data.json;
    const binningMethod = this.data.properties?.binningMethod;
    const numberOfBins = this.data.properties?.numberOfBins;
    const customBinEdges = this.data.properties?.customBinEdges;
    const columnToBin = this.data.properties?.columnToBin;

    if (!data || !columnToBin) {
      console.error("Invalid input or column specification");
      throw new Error("Invalid input or column specification");
    }

    let binnedData;
    switch (binningMethod) {
      case "equal-width":
        binnedData = this.equalWidthBinning(data, columnToBin, numberOfBins);
        break;
      case "equal-frequency":
        binnedData = this.equalFrequencyBinning(
          data,
          columnToBin,
          numberOfBins
        );
        break;
      case "custom":
        const edges = customBinEdges
          .split(",")
          .map((edge: any) => parseFloat(edge.trim()));
        binnedData = this.customBinning(data, columnToBin, edges);
        break;
      default:
        throw new Error("Invalid binning method");
    }

    return {
      binnedData: {
        json: binnedData,
        binary: null,
      },
    };
  }

  equalWidthBinning(data: any[], column: string, numberOfBins: number): any[] {
    const values = data.map((row) => row[column]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numberOfBins;

    return data.map((row) => {
      const value = row[column];
      const binIndex = Math.floor((value - min) / binWidth);
      row[column] = `Bin ${Math.min(binIndex, numberOfBins - 1)}`;
      return row;
    });
  }

  equalFrequencyBinning(
    data: any[],
    column: string,
    numberOfBins: number
  ): any[] {
    const sortedData = [...data].sort((a, b) => a[column] - b[column]);
    const binSize = Math.ceil(sortedData.length / numberOfBins);

    return sortedData.map((row, index) => {
      const binIndex = Math.floor(index / binSize);
      row[column] = `Bin ${Math.min(binIndex, numberOfBins - 1)}`;
      return row;
    });
  }

  customBinning(data: any[], column: string, edges: number[]): any[] {
    return data.map((row) => {
      const value = row[column];
      const binIndex = edges.findIndex(
        (edge, index) => value >= edge && value < (edges[index + 1] || Infinity)
      );
      row[column] = `Bin ${binIndex}`;
      return row;
    });
  }
}
