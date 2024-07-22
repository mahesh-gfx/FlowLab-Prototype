import { WorkflowNode, NodeData } from "@data-viz-tool/shared";

export abstract class BaseNode implements WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;

  constructor(node: WorkflowNode) {
    this.id = node.id;
    this.type = node.type;
    this.position = node.position;
    this.data = node.data;
  }

  abstract getFrontendConfig(): Record<string, any>;
  abstract execute(inputs: Record<string, any>): Promise<Record<string, any>>;
}
