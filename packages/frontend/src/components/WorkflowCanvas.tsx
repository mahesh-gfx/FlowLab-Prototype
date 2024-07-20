import React, { useCallback, useState, DragEvent } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  XYPosition,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import NodePanel from "./NodePanel";

export interface CustomNodeData {
  label: string;
  type: string;
}

export interface NodeTypes {
  type: string;
  label: string;
}

const initialNodes: Node<CustomNodeData>[] = [
  {
    id: "1",
    position: { x: 250, y: 0 },
    data: { label: "Input", type: "input" },
  },
  {
    id: "2",
    position: { x: 250, y: 100 },
    data: { label: "Process", type: "process" },
  },
];

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

const nodeTypes: NodeTypes[] = [
  { type: "input", label: "Input Node" },
  { type: "process", label: "Process Node" },
  { type: "output", label: "Output Node" },
];

let id = 3;
const getId = () => `${id++}`;

const WorkflowCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData("application/reactflow");
      const position = reactFlowInstance.project({
        x: event.clientX,
        y: event.clientY,
      }) as XYPosition;

      const newNode: Node<CustomNodeData> = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node`, type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div style={{ display: "flex", height: "600px" }}>
      <NodePanel nodeTypes={nodeTypes} onDragStart={onDragStart} />
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
