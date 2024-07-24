import React, { useState, useEffect } from "react";
import { Node } from "reactflow";
import { NodeData, NodeProperty } from "@data-viz-tool/shared";
import "./styles/nodeConfigPopup.css";

interface NodeConfigPopupProps {
  node: Node<NodeData>;
  nodeDefinition: {
    properties: NodeProperty[];
  };
  onClose: () => void;
  onUpdate: (nodeId: string, newData: Partial<NodeData>) => void;
}

const NodeConfigPopup: React.FC<NodeConfigPopupProps> = ({
  node,
  nodeDefinition,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<"config" | "output">("config");
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

  const handleFileChange = (propertyName: string, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleChange(propertyName, {
          name: file.name,
          content: result,
        });
      };
      reader.readAsDataURL(file); // Read file as base64 string
    } else {
      handleChange(propertyName, null);
    }
  };

  const handleSubmit = () => {
    onUpdate(node.id, config);
    console.log("All configs: ", config);
    onClose();
  };

  const renderConfigurationForm = () => {
    return nodeDefinition.properties.map((prop) => {
      const value = config.properties?.[prop.name] || prop.default;
      switch (prop.type) {
        case "string":
        case "text":
          return (
            <div key={prop.name} className="form-group">
              <label htmlFor={prop.name}>{prop.displayName}</label>
              <input
                type={prop.type === "string" ? "text" : "textarea"}
                id={prop.name}
                value={value}
                onChange={(e) => handleChange(prop.name, e.target.value)}
              />
            </div>
          );
        case "number":
          return (
            <div key={prop.name} className="form-group">
              <label htmlFor={prop.name}>{prop.displayName}</label>
              <input
                type="number"
                id={prop.name}
                value={value}
                onChange={(e) =>
                  handleChange(prop.name, parseFloat(e.target.value))
                }
              />
            </div>
          );
        case "boolean":
          return (
            <div key={prop.name} className="form-group">
              <label htmlFor={prop.name}>{prop.displayName}</label>
              <input
                type="checkbox"
                id={prop.name}
                checked={value}
                onChange={(e) => handleChange(prop.name, e.target.checked)}
              />
            </div>
          );
        case "options":
          return (
            <div key={prop.name} className="form-group">
              <label htmlFor={prop.name}>{prop.displayName}</label>
              <select
                id={prop.name}
                value={value}
                onChange={(e) => handleChange(prop.name, e.target.value)}
              >
                {prop.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          );
        case "file":
          return (
            <div key={prop.name} className="form-group">
              <label htmlFor={prop.name}>{prop.displayName}</label>
              <input
                type="file"
                id={prop.name}
                onChange={(e) =>
                  handleFileChange(prop.name, e.target.files?.[0] || null)
                }
              />
              {value && value.name && <div>Uploaded file: {value.name}</div>}
            </div>
          );
        default:
          return null;
      }
    });
  };

  const renderOutput = () => {
    return (
      <div>
        <h3>Output</h3>
        <pre>{JSON.stringify(node.data.executionResult, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="node-config-popup-wrapper">
      <div className="node-config-popup">
        <h2 className="node-config-title">{node.data.label} Configuration</h2>
        <div className="node-config-tabs">
          <button
            className={`node-config-tab ${
              activeTab === "config" ? "active" : ""
            }`}
            onClick={() => setActiveTab("config")}
          >
            Configuration
          </button>
          <button
            className={`node-config-tab ${
              activeTab === "output" ? "active" : ""
            }`}
            onClick={() => setActiveTab("output")}
          >
            Output
          </button>
        </div>
        <div className="node-config-content">
          {activeTab === "config" ? renderConfigurationForm() : renderOutput()}
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
