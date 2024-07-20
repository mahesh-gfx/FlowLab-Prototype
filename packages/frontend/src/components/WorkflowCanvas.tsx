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
import NodeConfigPopup from "./NodeConfigPopup";

export interface CustomNodeData {
  label: string;
  type: string;
  handlePosition?: "top" | "right" | "bottom" | "left";
  style?: {
    backgroundColor?: string; // Optional for node color
  };
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
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(
    null
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

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
        data: { label: `${type} node`, type, handlePosition: "bottom" }, // Set default handle position
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node<CustomNodeData>) => {
      setSelectedNode(node);
    },
    []
  );

  const closePopup = () => {
    setSelectedNode(null);
  };

  const updateNodeData = (nodeId: string, newData: Partial<CustomNodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
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
          onInit={onInit}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDoubleClick={onNodeDoubleClick}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      {selectedNode && (
        <NodeConfigPopup
          node={selectedNode}
          onClose={closePopup}
          onUpdate={updateNodeData}
        />
      )}
    </div>
  );
};

export default WorkflowCanvas;
