import { BaseNode } from "../BaseNode";
import { WorkflowNode } from "@data-viz-tool/shared";

export class StartNode extends BaseNode {
  constructor(node: WorkflowNode) {
    super(node);
  }

  getFrontendConfig() {
    return {
      label: "Start Node",
      color: "#00ff00",
      inputs: [],
      outputs: ["output"],
    };
  }

  async execute(inputs: Record<string, any>) {
    return { output: "Workflow started" };
  }
}
