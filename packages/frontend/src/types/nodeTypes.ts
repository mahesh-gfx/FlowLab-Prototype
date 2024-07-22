export interface NodeConfigOption {
  label: string;
  type: "string" | "number" | "boolean" | "select";
  options?: string[]; // For select type
  default?: any;
}

export interface NodeTypeConfig {
  label: string;
  configOptions: {
    [key: string]: NodeConfigOption;
  };
}

export const nodeConfigs: { [key: string]: NodeTypeConfig } = {
  input: {
    label: "Input Node",
    configOptions: {
      dataSource: { label: "Data Source", type: "string", default: "" },
      format: {
        label: "Data Format",
        type: "select",
        options: ["CSV", "JSON", "XML"],
        default: "CSV",
      },
    },
  },
  process: {
    label: "Process Node",
    configOptions: {
      operation: {
        label: "Operation",
        type: "select",
        options: ["Filter", "Sort", "Aggregate"],
        default: "Filter",
      },
      field: { label: "Field", type: "string", default: "" },
    },
  },
  output: {
    label: "Output Node",
    configOptions: {
      destination: { label: "Destination", type: "string", default: "" },
      format: {
        label: "Output Format",
        type: "select",
        options: ["CSV", "JSON", "XML"],
        default: "CSV",
      },
    },
  },
};
