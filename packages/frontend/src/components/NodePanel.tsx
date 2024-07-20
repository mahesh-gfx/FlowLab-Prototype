import React from "react";
import { NodeTypes } from "./WorkflowCanvas";

interface NodePanelProps {
  nodeTypes: NodeTypes[];
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => void;
}

const NodePanel: React.FC<NodePanelProps> = ({ nodeTypes, onDragStart }) => {
  return (
    <div
      className="node-panel"
      style={{
        width: "200px",
        height: "100%",
        backgroundColor: "#f0f0f0",
        padding: "10px",
        overflowY: "auto",
      }}
    >
      <h3>Available Nodes</h3>
      {nodeTypes.map((nodeType) => (
        <div
          key={nodeType.type}
          draggable
          onDragStart={(event) => onDragStart(event, nodeType.type)}
          style={{
            padding: "10px",
            margin: "5px 0",
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "move",
          }}
        >
          {nodeType.label}
        </div>
      ))}
    </div>
  );
};

export default NodePanel;
