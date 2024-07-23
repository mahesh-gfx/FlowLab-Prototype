import React, { useState, useEffect } from "react";
import { Node } from "reactflow";
import { NodeData } from "@data-viz-tool/shared";
import "./styles/nodeConfigPopup.css";

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
  const [config, setConfig] = useState<Partial<NodeData>>({});

  useEffect(() => {
    setConfig(node.data);
  }, [node]);

  const handleChange = (propertyName: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      properties: {
        ...prev.properties,
        [propertyName]: value,
      },
    }));
  };

  const handleSubmit = () => {
    onUpdate(node.id, config);
    onClose();
  };

  return (
    <div
      className="node-config-popup-wrapper"
      style={{
        position: "fixed",
        height: "100vh",
        width: "100vw",
        display: "flex",
        top: "0px",
        bottom: "0px",
        left: "0px",
        right: "0px",
        zIndex: 10,
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2>{node.data.label} Configuration</h2>
        {Object.entries(node.data.properties || {}).map(([key, value]) => {
          return (
            <div key={key}>
              <label>{key}: </label>
              <input
                type="text"
                value={config.properties?.[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          );
        })}
        <button onClick={handleSubmit}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default NodeConfigPopup;
