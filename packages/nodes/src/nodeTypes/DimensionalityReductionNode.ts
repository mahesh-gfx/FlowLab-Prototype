import { BaseNode, NodeDefinition } from "../BaseNode";
import { PCA, TSNE, UMAP, Matrix } from "@data-viz-tool/druidjs"; // Import the interfaces

export class DimensionalityReductionNode extends BaseNode {
  constructor(node: Partial<DimensionalityReductionNode>) {
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
          displayOptions: {
            show: {
              algorithm: ["PCA", "t-SNE", "UMAP"],
            },
          },
        },
        // Additional properties for t-SNE
        {
          displayName: "Perplexity",
          name: "perplexity",
          type: "number",
          default: 30,
          description: "Perplexity for t-SNE",
          displayOptions: {
            show: {
              algorithm: ["t-SNE"],
            },
          },
        },
        {
          displayName: "Learning Rate",
          name: "epsilon",
          type: "number",
          default: 10,
          description: "Learning rate for t-SNE",
          displayOptions: {
            show: {
              algorithm: ["t-SNE"],
            },
          },
        },
        // Additional properties for UMAP
        {
          displayName: "Number of Neighbors",
          name: "n_neighbors",
          type: "number",
          default: 15,
          description: "Number of neighbors for UMAP",
          displayOptions: {
            show: {
              algorithm: ["UMAP"],
            },
          },
        },
        {
          displayName: "Minimum Distance",
          name: "min_dist",
          type: "number",
          default: 0.1,
          description: "Minimum distance for UMAP",
          displayOptions: {
            show: {
              algorithm: ["UMAP"],
            },
          },
        },
      ],
      version: 1,
    };
  }

  getNodeDefinition(): NodeDefinition {
    return DimensionalityReductionNode.getNodeDefinition();
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    const data = inputs.data.data.json;
    const algorithm = this.data.properties?.algorithm;
    const nComponents = this.data.properties?.nComponents;
    const ignoreLastColumn = this.data.properties?.ignoreLastColumn;

    // Log the input data
    console.log("Input data:", data);

    try {
      // Transform the input data to a 2D array of numerical values
      const { transformedData, lastColumn } = transformDataToMatrixFormat(
        data,
        ignoreLastColumn
      );

      // Dynamically import the DruidJS library from the local package
      const druid = await import("@data-viz-tool/druidjs");

      const matrix = druid.Matrix.from(transformedData);
      let reducedData: number[][];

      switch (algorithm) {
        case "PCA":
          const pca: PCA = new druid.PCA(matrix, { d: nComponents });
          reducedData = (pca.transform() as Matrix).to2dArray.map((row) =>
            Array.from(row)
          );
          break;
        case "t-SNE":
          const perplexity = this.data.properties?.perplexity;
          const epsilon = this.data.properties?.epsilon;
          const tsne: TSNE = new druid.TSNE(matrix, {
            d: nComponents,
            perplexity,
            epsilon,
          });
          const tsneResult = tsne.transform();
          reducedData =
            tsneResult instanceof druid.Matrix
              ? tsneResult.to2dArray.map((row) => Array.from(row))
              : tsneResult;
          break;
        case "UMAP":
          const n_neighbors = this.data.properties?.n_neighbors;
          const min_dist = this.data.properties?.min_dist;
          const umap: UMAP = new druid.UMAP(matrix, {
            n_neighbors,
            min_dist,
            d: nComponents,
          });
          const umapResult = umap.transform();
          reducedData =
            umapResult instanceof druid.Matrix
              ? umapResult.to2dArray.map((row) => Array.from(row))
              : umapResult;
          break;
        default:
          throw new Error("Unsupported algorithm");
      }

      // Include the last column in the final output if it was ignored
      if (ignoreLastColumn && lastColumn.length > 0) {
        reducedData = reducedData.map((row, index) => [
          ...row,
          lastColumn[index],
        ]);
      }

      return {
        data: {
          json: reducedData,
          binary: null,
        },
      };
    } catch (error) {
      console.error("Error in DimensionalityReductionNode:", error);
      throw error; // Re-throw the error after logging
    }
  }
}

// Transformation method
function transformDataToMatrixFormat(
  data: any[],
  ignoreLastColumn: boolean
): { transformedData: number[][]; lastColumn: any[] } {
  // Ensure the input data is an array of objects
  if (!Array.isArray(data) || typeof data[0] !== "object") {
    throw new Error("Input data must be an array of objects");
  }

  const transformedData: number[][] = [];
  const lastColumn: any[] = [];

  data.forEach((row) => {
    const values = Object.values(row);
    if (ignoreLastColumn) {
      lastColumn.push(values.pop()); // Remove and store the last column
    }
    transformedData.push(
      values.filter((value) => typeof value === "number") as number[]
    );
  });

  // Check if the transformed data is valid for dimensionality reduction
  if (transformedData.length === 0 || transformedData[0].length === 0) {
    throw new Error("No numeric data available for dimensionality reduction");
  }

  return { transformedData, lastColumn };
}
