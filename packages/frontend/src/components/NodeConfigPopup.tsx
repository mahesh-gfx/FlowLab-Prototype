import React, { useState } from "react";
import { Node } from "reactflow";
import { CustomNodeData } from "./WorkflowCanvas";

interface NodeConfigPopupProps {
  node: Node<CustomNodeData>;
  onClose: () => void;
  onUpdate: (nodeId: string, newData: Partial<CustomNodeData>) => void;
}

const NodeConfigPopup: React.FC<NodeConfigPopupProps> = ({
  node,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState("parameters");
  const [nodeColor, setNodeColor] = useState(
    node.style?.backgroundColor || "#ffffff"
  );

  // Explicitly type handlePosition
  const [handlePosition, setHandlePosition] = useState<
    "top" | "right" | "bottom" | "left"
  >(node.data.handlePosition || "bottom");

  const handleColorChange = (color: string) => {
    setNodeColor(color);
    onUpdate(node.id, { style: { ...node.style, backgroundColor: color } });
  };

  const handlePositionChange = (
    position: "top" | "right" | "bottom" | "left"
  ) => {
    setHandlePosition(position);
    onUpdate(node.id, { handlePosition: position }); // Update the handle position
  };

  return (
    <div
      className="node-config-popup"
      style={
        {
          /* styles */
        }
      }
    >
      <h2>{node.data.label} Configuration</h2>
      <div className="tabs">
        <button onClick={() => setActiveTab("parameters")}>Parameters</button>
        <button onClick={() => setActiveTab("settings")}>Settings</button>
        <button onClick={() => setActiveTab("connections")}>Connections</button>
      </div>
      <div className="tab-content">
        {activeTab === "settings" && (
          <div>
            <h3>Settings</h3>
            <label>
              Handle Position:
              <select
                value={handlePosition}
                onChange={(e) =>
                  handlePositionChange(
                    e.target.value as "top" | "right" | "bottom" | "left"
                  )
                }
              >
                <option value="top">Top</option>
                <option value="right">Right</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
              </select>
            </label>
          </div>
        )}
        {/* Other tab contents */}
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default NodeConfigPopup;
