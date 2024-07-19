import React from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const WorkflowCanvas: React.FC = () => {
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges}>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
