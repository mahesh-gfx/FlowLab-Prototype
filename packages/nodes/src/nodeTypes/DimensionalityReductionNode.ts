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
      icon: "ReduceDimensions",
      color: "#F53900",
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
        {
          displayName: "Skip Columns",
          name: "skipColumns",
          type: "string",
          default: "",
          description:
            "Comma-separated list of columns to skip for dimensionality reduction",
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
    const skipColumns = this.data.properties?.skipColumns || "";
    const keys = "xyzabcdefghijklmnopqrstuvw".split("");

    // Log the input data
    console.log("Input data:", data);

    try {
      // Transform the input data to a 2D array of numerical values
      const { transformedData, columnNames } = transformDataToMatrixFormat(
        data,
        skipColumns
      );

      // Dynamically import the DruidJS library from the local package
      const druid = await import("@data-viz-tool/druidjs");

      const matrix = druid.Matrix.from(transformedData);
      let reducedData: any;

      switch (algorithm) {
        case "PCA":
          const pca: PCA = new druid.PCA(matrix, { d: nComponents });
          reducedData = (pca.transform() as Matrix).to2dArray.map((row) => {
            const obj: Record<string, number> = {};
            row.forEach((value, index) => {
              const key = keys[index] || `key${index}`; // Fallback key if keys run out
              obj[key] = value;
            });
            return obj;
          });
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
              ? tsneResult.to2dArray.map((row) => {
                  const obj: Record<string, number> = {};
                  row.forEach((value, index) => {
                    const key = keys[index] || `key${index}`; // Fallback key if keys run out
                    obj[key] = value;
                  });
                  return obj;
                })
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
              ? umapResult.to2dArray.map((row) => {
                  const obj: Record<string, number> = {};
                  row.forEach((value, index) => {
                    const key = keys[index] || `key${index}`; // Fallback key if keys run out
                    obj[key] = value;
                  });
                  return obj;
                })
              : umapResult;
          break;
        default:
          throw new Error("Unsupported algorithm");
      }

      return {
        data: {
          json: { reducedData: reducedData, originalData: data },
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
  skipColumns: string
): { transformedData: number[][]; columnNames: string[] } {
  // Ensure the input data is an array of objects
  if (!Array.isArray(data) || typeof data[0] !== "object") {
    throw new Error("Input data must be an array of objects");
  }

  const transformedData: number[][] = [];
  let columnNames: string[] = [];

  const skipColumnsArray = skipColumns
    .split(",")
    .map((col) => col.trim().toLowerCase());

  data.forEach((row, index) => {
    const values = Object.values(row);
    const keys = Object.keys(row);

    if (index === 0) {
      columnNames = [...keys]; // Capture the column names from the first row
    }

    const filteredValues = keys.reduce((acc, key, i) => {
      if (
        !skipColumnsArray.includes(key.toLowerCase()) &&
        typeof values[i] === "number"
      ) {
        acc.push(values[i] as number);
      }
      return acc;
    }, [] as number[]);

    transformedData.push(filteredValues);
  });

  console.log("Transformed data: ", transformedData);
  console.log("Column names: ", columnNames);

  // Check if the transformed data is valid for dimensionality reduction
  if (transformedData.length === 0 || transformedData[0].length === 0) {
    throw new Error("No numeric data available for dimensionality reduction");
  }

  return { transformedData, columnNames };
}
