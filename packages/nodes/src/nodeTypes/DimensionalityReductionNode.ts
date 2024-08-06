import { BaseNode, NodeDefinition } from "../BaseNode";

export class DimensionalityReductionNode extends BaseNode {
  constructor(node: Partial<BaseNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "DimensionalityReductionNode",
      displayName: "Dimensionality Reduction",
      description: "Applies a dimensionality reduction algorithm on the data",
      icon: "reduce-dimensions",
      color: "#FF5733",
      inputs: ["data"],
      outputs: ["data"],
      properties: [
        {
          displayName: "Algorithm",
          name: "algorithm",
          type: "options",
          default: "PCA",
          description: "Select the dimensionality reduction algorithm",
          options: [
            { name: "PCA", value: "PCA" },
            { name: "t-SNE", value: "t-SNE" },
            { name: "UMAP", value: "UMAP" },
          ],
        },
        {
          displayName: "Number of Components",
          name: "nComponents",
          type: "number",
          default: 2,
          description: "Number of components to reduce to",
        },
      ],
      version: 1,
    };
  }

  getNodeDefinition(): NodeDefinition {
    return DimensionalityReductionNode.getNodeDefinition();
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    const data = inputs.data.json;
    const algorithm = this.data.properties?.algorithm;
    const nComponents = this.data.properties?.nComponents;

    // Dynamically import druid.js
    const druid = await import("@saehrimnir/druidjs");

    const matrix = druid.Matrix.from(data);
    let reducedData;

    switch (algorithm) {
      case "PCA":
        reducedData = new druid.PCA(matrix, nComponents).to2dArray();
        break;
      case "t-SNE":
        reducedData = new druid.TSNE(matrix, nComponents).to2dArray();
        break;
      case "UMAP":
        reducedData = new druid.UMAP(matrix, nComponents).to2dArray();
        break;
      default:
        throw new Error("Unsupported algorithm");
    }

    return {
      data: {
        json: reducedData,
        binary: null,
      },
    };
  }
}
