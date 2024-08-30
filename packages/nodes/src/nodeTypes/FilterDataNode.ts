import { BaseNode, NodeDefinition } from "../BaseNode";

export class FilterDataNode extends BaseNode {
  constructor(node: Partial<FilterDataNode>) {
    super(node);
  }

  static getNodeDefinition(): NodeDefinition {
    return {
      name: "FilterDataNode",
      displayName: "Filter Data",
      description:
        "Filters data based on multiple criteria and excludes specified columns from output",
      icon: "Filter",
      color: "#E621F5",
      inputs: ["data"],
      outputs: ["data"],
      properties: [
        {
          displayName: "Filter Criteria",
          name: "filterCriteria",
          type: "list",
          default: [],
          description: "List of filter criteria",
          itemType: {
            type: "object",
            properties: [
              {
                displayName: "Column",
                name: "column",
                type: "string",
                default: "",
                description: "The column to apply the filter on",
              },
              {
                displayName: "Operation",
                name: "operation",
                type: "options",
                description:
                  "The operation to use for filtering (equals, contains, greaterThan, lessThan)",
                options: [
                  { name: "Equals", value: "equals" },
                  { name: "Contains", value: "contains" },
                  { name: "Greater Than", value: "greaterThan" },
                  { name: "Less Than", value: "lessThan" },
                ],
              },
              {
                displayName: "Value",
                name: "value",
                type: "string",
                default: "",
                description: "The value to filter the column by",
              },
            ],
          },
        },
        {
          displayName: "Exclude Columns",
          name: "excludeColumns",
          type: "string",
          default: "",
          description:
            "Comma-separated list of columns to exclude from the output",
        },
      ],
      version: 1,
    };
  }

  async execute(inputs: Record<string, any>): Promise<any> {
    const data = inputs.data.data.json;
    const excludeColumns = this.data?.properties?.excludeColumns;
    const filterCriteria = this.data?.properties?.filterCriteria;

    if (!data || !filterCriteria || filterCriteria.length === 0) {
      console.error("Invalid input or filter criteria");
      throw new Error("Invalid input or filter criteria");
    }

    let filteredData = this.applyFilters(data, filterCriteria);

    if (excludeColumns) {
      const columnsToExclude = excludeColumns
        .split(",")
        .map((col: any) => col.trim());
      filteredData = this.excludeColumns(filteredData, columnsToExclude);
    }

    return {
      data: {
        json: filteredData,
        binary: null,
      },
    };
  }

  applyFilters(data: any[], criteria: any[]): any[] {
    return data.filter((row) => {
      return criteria.every(({ column, value, operation }) => {
        const cellValue = row[column];
        switch (operation) {
          case "equals":
            return cellValue === value;
          case "contains":
            return typeof cellValue === "string" && cellValue.includes(value);
          case "greaterThan":
            return cellValue > value;
          case "lessThan":
            return cellValue < value;
          default:
            return false;
        }
      });
    });
  }

  excludeColumns(data: any[], columns: string[]): any[] {
    return data.map((row) => {
      const filteredRow: any = { ...row };
      columns.forEach((column) => {
        delete filteredRow[column];
      });
      return filteredRow;
    });
  }
}
