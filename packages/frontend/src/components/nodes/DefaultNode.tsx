import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { WorkflowContext } from "../../context/WorkflowContext";
import { camelCaseToTitleCase, getContrastColor } from "@data-viz-tool/shared";
import CustomHandle from "../handle/CustomHandle";
import IconLoader from "../ComponentLoader";
import LinearProgress from "@mui/material/LinearProgress";

const DefaultNode = ({ id, data, def, type, children }: any) => {
  const { deleteNodeById, edges, executionResults, isExecuting } =
    useContext(WorkflowContext);
  const { getNode } = useReactFlow();
  const isExecuted = executionResults.hasOwnProperty(`${id}`);

  const handleDelete = () => {
    deleteNodeById(id);
  };

  const calculateHandlePosition = (nodeId: any, handleType: any) => {
    const node = getNode(nodeId) || { position: { x: 0, y: 0 } };
    const allEdges = edges.filter((edge: any) =>
      handleType === "target" ? edge.target === nodeId : edge.source === nodeId
    );

    if (allEdges.length === 0) {
      return handleType === "target" ? Position.Left : Position.Right;
    }

    const connectedNodeId =
      handleType === "target" ? allEdges[0].source : allEdges[0].target;
    const connectedNode = getNode(connectedNodeId);

    if (!connectedNode) {
      return handleType === "target" ? Position.Left : Position.Right;
    }

    // Calculate relative positions
    const dx = connectedNode.position.x - node.position.x;
    const dy = connectedNode.position.y - node.position.y;

    if (handleType === "target") {
      // Target handle can be on the top or left
      return Math.abs(dx) > Math.abs(dy) ? Position.Left : Position.Top;
    } else {
      // Source handle can be on the right or bottom
      return Math.abs(dx) > Math.abs(dy) ? Position.Right : Position.Bottom;
    }
  };

  return (
    <div
      className="node"
      style={{
        borderRadius: "10px",
        width: 180,
        fontSize: "12px",
        border: data.properties ? `2px solid ${def.color}` : "",
        overflow: "hidden",
        background: "white",
      }}
    >
      {def.inputs.map((input: any, index: any) => (
        <CustomHandle
          nodeId={id}
          key={`input-${index}`}
          type="target"
          position={calculateHandlePosition(id, "target")}
          id={input}
        />
      ))}
      <div
        style={{
          fontWeight: "bold",
          borderBottom: `1px solid ${def.color}`,
          padding: "2px 10px",
          fontSize: "10px",
          backgroundColor: def.color,
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconLoader
          iconName={def.icon}
          fontSize="xsmall"
          color={getContrastColor(def.color)}
        />
        <span style={{ marginLeft: "5px", color: getContrastColor(def.color) }}>
          {data.label}
        </span>

        <div className="node-delete-button-wrapper">
          {type !== "StartNode" && (
            <button className="node-delete-button" onClick={handleDelete}>
              <FontAwesomeIcon icon={faTrash} size="2xs" />
            </button>
          )}
        </div>
      </div>
      <div style={{ width: "100%", height: "5px" }}>
        {!isExecuted && isExecuting && (
          <LinearProgress style={{ height: "3px" }} />
        )}
      </div>
      {data?.properties && (
        <div style={{ padding: "5px 10px" }}>
          {data.properties != null &&
            data.properties != undefined &&
            Object.keys(data?.properties).map((property: any) => {
              return typeof data?.properties[property] == "string" ||
                typeof data?.properties[property] == "number" ? (
                <div style={{ display: "flex", fontSize: "6px" }}>
                  <div style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                    {camelCaseToTitleCase(property)} :&nbsp; &nbsp;
                  </div>
                  <div style={{ color: "grey" }}>
                    {data.properties[property]}
                  </div>
                </div>
              ) : (
                typeof data?.properties[property] == "object" && (
                  <div style={{ display: "flex", fontSize: "6px" }}>
                    <div style={{ fontWeight: "bold" }}>
                      {camelCaseToTitleCase(property)} :&nbsp; &nbsp;
                    </div>
                    <div style={{ color: "grey" }}>
                      {(data.properties[property] &&
                        typeof data.properties[property] === "object" &&
                        JSON.stringify(
                          Object.values(data.properties[property])[0]
                        )) ||
                        Object.values(data.properties[property])[0] ||
                        null}
                    </div>
                  </div>
                )
              );
            })}
        </div>
      )}
      {children}
      {data.error && (
        <div className="node-error" style={{ color: "red", fontSize: "10px" }}>
          {data.error}
        </div>
      )}
      {def.outputs.map((output: any, index: any) => (
        <CustomHandle
          nodeId={id}
          key={`output-${index}`}
          type="source"
          position={calculateHandlePosition(id, "source")}
          id={output}
          style={{ background: "red" }}
        />
      ))}
    </div>
  );
};

export default DefaultNode;
