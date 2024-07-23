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
    <div className="node-config-popup-wrapper">
      <div className="node-config-popup">
        <span className="node-config-title">{node.data.label}</span>
        <span className="node-config-sub-title">Configuration</span>
        <div className="node-config-form">
          {Object.entries(node.data.properties || {}).map(([key, value]) => {
            return (
              <div key={key} className="node-config-form-group">
                <label className="node-config-label">{key} </label>
                <input
                  type="text"
                  className="node-config-input"
                  value={config.properties?.[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            );
          })}
        </div>
        <div className="node-config-actions">
          <button
            className="node-config-button node-config-button-save"
            onClick={handleSubmit}
          >
            Save
          </button>
          <button
            className="node-config-button node-config-button-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigPopup;
