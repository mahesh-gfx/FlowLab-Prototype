import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import { Node } from "reactflow";
import { NodeData, NodeProperty } from "@data-viz-tool/shared";
import VirtualizedTable from "./VirtualizedTable";
import "./styles/nodeConfigPopup.css";
import VirtualizedJsonView from "./VirtualisedJSONViewer";
import { WorkflowContext } from "../context/WorkflowContext";
import ControlledCheckbox from "./Checkbox";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

interface NodeConfigPopupProps {
  node: Node;
  nodeDefinition: {
    properties: NodeProperty[];
    [key: string]: any;
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
  const [config, setConfig] = useState<NodeData>({
    label: node.data.label || "Default Label", // Ensure a default label
    type: node.data.type || "Default Type", // Ensure a default type
    properties: {},
    output: node.data.output || {}, // Ensure a default output
  });
  const [outputView, setOutputView] = useState<"table" | "json" | "binary">(
    "json"
  );
  const [properties, setProperties] = useState<Record<string, any>>({});
  const { NodeConfigModalIsOpen }: any = useContext(WorkflowContext);

  useEffect(() => {
    setConfig(node.data);
    setProperties(node.data.properties);
  }, [node]);

  const handleChange = (propertyName: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      properties: {
        ...prev.properties,
        [propertyName]: value,
      },
    }));
    setProperties((prev) => ({
      ...prev,
      [propertyName]: value,
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
      reader.readAsDataURL(file);
    } else {
      handleChange(propertyName, null);
    }
  };

  const handleAddListItem = (listName: string, defaultItem: any) => {
    const updatedList = [...(properties[listName] || []), defaultItem];
    console.log("Updated list: ", updatedList);
    handleChange(listName, updatedList);
  };

  const handleRemoveListItem = (listName: string, index: number) => {
    const updatedList = [...(properties[listName] || [])];
    updatedList.splice(index, 1);
    handleChange(listName, updatedList);
  };

  const handleListItemChange = (
    listName: string,
    index: number,
    subName: string,
    subValue: any
  ) => {
    console.log(
      "handling list item change... \n",
      "listname: ",
      listName,
      "index",
      index,
      "subname:",
      subName,
      "subValue:",
      subValue
    );
    const updatedList = [...(properties[listName] || [])];
    updatedList[index] = { ...updatedList[index], [subName]: subValue };
    handleChange(listName, updatedList);
  };

  const handleSubmit = () => {
    console.log("Saving form...");
    onUpdate(node.id, config);
    onClose();
  };

  const displayField = (show: any) => {
    if (show == null) return true;
    for (const key in show) {
      if (show[key] && properties.hasOwnProperty(key)) {
        const commonValues = show[key].filter(
          (value: any) => properties[key] == value
        );
        if (commonValues.length > 0) return true;
      }
    }
    return false;
  };

  const renderConfigurationForm = (): JSX.Element => {
    console.log("rendering configuration form...");
    return (
      <div className="form-group-wrapper">
        {nodeDefinition.properties.map((prop) => {
          const value = config.properties?.[prop.name] || prop.default;
          if (!displayField(prop.displayOptions?.show || null)) return null;
          switch (prop.type) {
            case "text":
              return (
                <div key={prop.name} className="form-group">
                  <label htmlFor={prop.name}>
                    {prop.displayName}
                    <span className="form-group-description">
                      {prop.description}
                    </span>
                  </label>
                  <textarea
                    id={prop.name}
                    value={value}
                    onChange={(e) => handleChange(prop.name, e.target.value)}
                  />
                </div>
              );
            case "string":
              return (
                <div key={prop.name} className="form-group">
                  <label htmlFor={prop.name}>
                    {prop.displayName}
                    <span className="form-group-description">
                      {prop.description}
                    </span>
                  </label>
                  <input
                    type={"text"}
                    id={prop.name}
                    value={value}
                    onChange={(e) => handleChange(prop.name, e.target.value)}
                  />
                </div>
              );
            case "number":
              return (
                <div key={prop.name} className="form-group">
                  <label htmlFor={prop.name}>
                    {prop.displayName}
                    <span className="form-group-description">
                      {prop.description}
                    </span>
                  </label>
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
            case "boolean": {
              return (
                <div key={prop.name} className="form-group">
                  <label htmlFor={prop.name}>
                    {prop.displayName}
                    <span className="form-group-description">
                      {prop.description}
                    </span>
                  </label>
                  <FormControl
                    component="fieldset"
                    style={{ padding: "5px 15px" }}
                  >
                    <RadioGroup
                      row
                      name="row-radio-buttons-group"
                      onChange={(e) => handleChange(prop.name, e.target.value)}
                      value={value}
                    >
                      <FormControlLabel
                        value={true}
                        control={<Radio />}
                        label="True"
                      />
                      <FormControlLabel
                        value={false}
                        control={<Radio />}
                        label="False"
                      />
                    </RadioGroup>
                  </FormControl>
                  {/* <ControlledCheckbox
                    key={prop.name}
                    id={prop.name}
                    // checked={false}
                    onChange={(checked: boolean) =>
                      handleChange(prop.name, checked)
                    }
                  /> */}
                </div>
              );
            }
            case "options":
              return (
                <div key={prop.name} className="form-group">
                  <label htmlFor={prop.name}>
                    {prop.displayName}
                    <span className="form-group-description">
                      {prop.description}
                    </span>
                  </label>
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
                  <label htmlFor={prop.name}>
                    {prop.displayName}
                    <span className="form-group-description">
                      {prop.description}
                    </span>
                  </label>
                  <input
                    type="file"
                    id={prop.name}
                    className="form-group-file-input"
                    onChange={(e) =>
                      handleFileChange(prop.name, e.target.files?.[0] || null)
                    }
                  />
                  {value && value.name && (
                    <div className="form-group-uploaded-file">
                      Uploaded CSV file:{" "}
                      <div className="form-group-uploaded-file-filename">
                        &nbsp;{value.name}
                      </div>
                    </div>
                  )}
                </div>
              );
            case "list":
              try {
                return (
                  <div key={prop.name} className="form-group">
                    <label>{prop.displayName}</label>
                    <span className="form-group-description">
                      {prop.description}
                    </span>
                    {(value || []).map((item: any, index: any) => (
                      <div key={index} className="list-item">
                        <span className="list-item-index">{index + 1}.</span>

                        {prop.itemType.properties.map((subProp: any) => {
                          const subValue = item[subProp.name];
                          console.log("subValue: ", subValue);
                          switch (subProp.type) {
                            case "string":
                              return (
                                <div key={subProp.name} className="form-group">
                                  <label
                                    htmlFor={`${prop.name}-${index}-${subProp.name}`}
                                  >
                                    {subProp.displayName}
                                  </label>
                                  <input
                                    type="text"
                                    id={`${prop.name}-${index}-${subProp.name}`}
                                    value={subValue}
                                    onChange={(e) =>
                                      handleListItemChange(
                                        prop.name,
                                        index,
                                        subProp.name,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              );
                            case "options":
                              return (
                                <div key={subProp.name} className="form-group">
                                  <label
                                    htmlFor={`${prop.name}-${index}-${subProp.name}`}
                                  >
                                    {subProp.displayName}
                                  </label>
                                  <select
                                    id={`${prop.name}-${index}-${subProp.name}`}
                                    value={subValue}
                                    onChange={(e) =>
                                      handleListItemChange(
                                        prop.name,
                                        index,
                                        subProp.name,
                                        e.target.value
                                      )
                                    }
                                  >
                                    {subProp.options?.map((option: any) => (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              );
                            default:
                              return null;
                          }
                        })}
                        <button
                          onClick={() => handleRemoveListItem(prop.name, index)}
                          className="button remove-from-list"
                        >
                          Remove {prop.displayName}
                        </button>
                      </div>
                    ))}

                    <button
                      className="button add-to-list-button"
                      onClick={() =>
                        handleAddListItem(prop.name, {
                          column: "",
                          value: "",
                          operation: "",
                        })
                      }
                    >
                      Add {prop.displayName}
                    </button>
                  </div>
                );
              } catch (error) {
                console.log("Error in list...");
                console.error(error);
              }

            default:
              return null;
          }
        })}
      </div>
    );
  };

  const renderOutput = (): JSX.Element => {
    const executionResult = node.data.output?.data;
    console.log("Execution result: ", executionResult);
    if (!executionResult) {
      return <div>No output available</div>;
    }

    const renderTableView = () => {
      const jsonData = executionResult.json;
      if (typeof jsonData === "object" && jsonData !== null) {
        let data: any[];

        if (Array.isArray(jsonData)) {
          data = jsonData;
        } else if (typeof jsonData === "object") {
          data = Object.values(jsonData);
        } else {
          return <div>Data is not in a suitable format for table view</div>;
        }

        if (data.length === 0) {
          return <div>No data available</div>;
        }

        return <VirtualizedTable data={data} />;
      }
      return <div>Data is not in a suitable format for table view</div>;
    };

    const renderJsonView = () => {
      return <VirtualizedJsonView data={executionResult.json} />;
    };

    const renderBinaryView = () => {
      if (executionResult.binary) {
        return <img src={executionResult.binary} alt="Binary data" />;
      }
      return <div>No binary data available</div>;
    };

    return (
      <div>
        <div className="output-view-selector">
          <button
            onClick={() => setOutputView("json")}
            className={outputView === "json" ? "active" : ""}
          >
            JSON
          </button>
          <button
            onClick={() => setOutputView("table")}
            className={outputView === "table" ? "active" : ""}
          >
            Table
          </button>
          <button
            onClick={() => setOutputView("binary")}
            className={outputView === "binary" ? "active" : ""}
          >
            Binary
          </button>
        </div>
        <div className="output-content">
          {outputView === "table" && renderTableView()}
          {outputView === "json" && renderJsonView()}
          {outputView === "binary" && renderBinaryView()}
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={NodeConfigModalIsOpen}
      onRequestClose={onClose}
      contentLabel="Node Configuration"
      className="node-config-popup-wrapper"
      overlayClassName="node-config-overlay"
    >
      <div className="node-config-popup">
        <span className="node-config-title">
          {node.data.label}{" "}
          <span className="node-config-sub-text">
            {" "}
            &nbsp;| Configuration & Output
          </span>
        </span>
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
              activeTab == "output" ? "active" : ""
            }`}
            onClick={() => setActiveTab("output")}
          >
            Output
          </button>
        </div>

        <div className="node-config-content">
          {activeTab === "config" ? renderConfigurationForm() : renderOutput()}
        </div>
        {activeTab == "config" && (
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
        )}
      </div>
    </Modal>
  );
};

export default NodeConfigPopup;
