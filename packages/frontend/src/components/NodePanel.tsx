import React from "react";

interface NodePanelProps {
  nodeTypes: string[];
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => void;
}

const NodePanel: React.FC<NodePanelProps> = ({ nodeTypes, onDragStart }) => {
  return (
    <aside style={{ position: "absolute", left: 10, top: "10%", zIndex: 4 }}>
      <div
        style={{
          position: "fixed",
          top: "85px",
          left: "10px",
          background: "white",
          padding: "20px",
          border: "1px solid black",
          borderRadius: "20px",
        }}
      >
        <span style={{ display: "block", fontWeight: "bold" }}>Node Types</span>
        <span style={{ fontSize: "12px", color: "grey" }}>
          Drag and drop Nodes on the Canvas
        </span>
        <div style={{ padding: "10px" }}>
          {nodeTypes.map((type) => (
            <div
              key={type}
              onDragStart={(event) => onDragStart(event, type)}
              draggable
              style={{
                margin: "5px 0",
                cursor: "grab",
                background: "blue",
                color: "white",
                padding: "5px 15px",
                borderRadius: "20px",
              }}
            >
              {type}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default NodePanel;
