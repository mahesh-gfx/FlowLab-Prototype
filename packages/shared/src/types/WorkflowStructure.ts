// packages/shared/src/types/WorkflowStructure.ts

export interface NodeData {
  label: string;
  type: string;
  properties: Record<string, any>;
  [key: string]: any;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface WorkflowStructure {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
