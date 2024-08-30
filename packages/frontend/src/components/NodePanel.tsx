import React from "react";
import "./styles/nodePanel.css";
import IconLoader from "./ComponentLoader";
import { getContrastColor } from "@data-viz-tool/shared";

interface NodePanelProps {
  nodeTypes: Record<string, any>;
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => void;
}

const NodePanel: React.FC<NodePanelProps> = ({ nodeTypes, onDragStart }) => {
  return (
    <aside
      style={{
        position: "absolute",
        top: "10%",
        zIndex: 4,
      }}
    >
      <div className="node-panel">
        <span className="node-panel-title">Nodes</span>
        <span className="node-panel-sub-title">
          Drag and drop Nodes on the Canvas
        </span>
        <div style={{ padding: "10px" }}>
          {Object.entries(nodeTypes).map(([key, def]) => (
            <div
              key={key}
              onDragStart={(event) => onDragStart(event, key)}
              draggable
              style={{
                margin: "5px 0",
                cursor: "grab",
                background: def.color,
                color: getContrastColor(def.color),
                padding: "5px 15px",
                borderRadius: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {def.displayName || key}

              <IconLoader
                iconName={def.icon}
                color={getContrastColor(def.color)}
                fontSize="medium"
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default NodePanel;
