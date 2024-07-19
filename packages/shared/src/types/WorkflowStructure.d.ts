export interface WorkflowNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: Record<string, any>;
}
export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
}
export interface WorkflowStructure {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}
