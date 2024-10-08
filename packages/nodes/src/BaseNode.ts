import { v4 as uuidv4 } from "uuid";
import { WorkflowNode, NodeData } from "@data-viz-tool/shared";

export abstract class BaseNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
  output: any;

  constructor(node: Partial<WorkflowNode>) {
    this.id = node.id || uuidv4();
    this.type = this.constructor.name;
    this.position = node.position || { x: 0, y: 0 };
    this.data = {
      ...this.getDefaultData(),
      ...node.data,
      label: node.data?.label || this.getNodeDefinition().displayName,
      type: this.type,
    };
    this.output = null; // Initialize output as null
  }

  static getNodeDefinition(): NodeDefinition {
    throw new Error("Static getNodeDefinition must be implemented in subclass");
  }

  getNodeDefinition(): NodeDefinition {
    return (this.constructor as typeof BaseNode).getNodeDefinition();
  }

  abstract execute(inputs: Record<string, any>): Promise<any>;

  getDefaultData(): Partial<NodeData> {
    return {
      label: this.getNodeDefinition().displayName,
      type: this.type,
    };
  }

  updateData(newData: Partial<NodeData>): void {
    this.data = { ...this.data, ...newData };
  }

  toJSON(): WorkflowNode {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      data: this.data,
    };
  }
}

export interface NodeDefinition {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  inputs: string[];
  outputs: string[];
  properties: NodeProperty[];
  version: number;
}

export interface NodeProperty {
  displayName: string;
  name: string;
  type: string;
  default: any;
  description: string;
  options?: { name: string; value: any }[];
  displayOptions?: {
    show?: Record<string, any>;
    hide?: Record<string, any>;
  };
  [key: string]: any;
}
