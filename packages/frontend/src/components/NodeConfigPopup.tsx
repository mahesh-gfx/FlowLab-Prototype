import React, { useState } from "react";
import { Node } from "reactflow";
import { NodeData } from "@data-viz-tool/shared";

interface NodeConfigPopupProps {
  node: Node<NodeData>;
  onClose: () => void;
  onUpdate: (nodeId: string, newData: Partial<NodeData>) => void;
}

const NodeConfigPopup: React.FC<NodeConfigPopupProps> = ({
  node,
  onClose,
  onUpdate,
}) => {
  const [label, setLabel] = useState(node.data.label);

  const handleSave = () => {
    onUpdate(node.id, { label });
    onClose();
  };

  return (
    <div
      className="node-config-popup"
      style={{
        position: "fixed",
        top: "100px",
        right: "10px",
        background: "white",
        padding: "20px",
        border: "1px solid black",
        borderRadius: "20px",
      }}
    >
      <h2>{node.data.label} Configuration</h2>
      <label>
        Label:
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </label>
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default NodeConfigPopup;
