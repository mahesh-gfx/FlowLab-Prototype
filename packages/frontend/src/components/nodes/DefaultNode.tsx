import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { Handle, Position, useReactFlow } from "reactflow";

const DefaultNode = ({ id, data, def, type }: any) => {
  const { setNodes } = useReactFlow();

  const handleDelete = () => {
    if (type != "StartNode")
      setNodes((nds) => nds.filter((node) => node.id !== id));
  };

  return (
    <div
      className="react-flow__node-default"
      style={{
        padding: "10px",
        borderRadius: "3px",
        width: 180,
        fontSize: "12px",
        backgroundColor: def.color,
      }}
    >
      {def.inputs.map((input: any, index: any) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={Position.Left}
          id={input}
          style={{
            top: `${((index + 1) / (def.inputs.length + 1)) * 100}%`,
          }}
        />
      ))}
      <div style={{ fontWeight: "bold" }}>{data.label}</div>
      {data.error && <div className="node-error-symbol" />}
      {data.error && (
        <div className="node-error" style={{ color: "red", fontSize: "10px" }}>
          {data.error}
        </div>
      )}
      {def.outputs.map((output: any, index: any) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Right}
          id={output}
          style={{
            top: `${((index + 1) / (def.outputs.length + 1)) * 100}%`,
          }}
        />
      ))}
      <div className="node-delete-button-wrapper">
        {type != "StartNode" && (
          <button className="node-delete-button" onClick={handleDelete}>
            <FontAwesomeIcon icon={faTrash} size="2xs" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DefaultNode;
