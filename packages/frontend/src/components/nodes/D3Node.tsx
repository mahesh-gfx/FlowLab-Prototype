import { useEffect, useRef } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Handle, Position, useReactFlow } from "reactflow";
import * as d3 from "d3";

const D3Node = ({ id, data, def, type }: any) => {
  const { setNodes } = useReactFlow();
  const d3Container = useRef(null);

  const handleDelete = () => {
    if (type !== "StartNode") {
      setNodes((nds) => nds.filter((node) => node.id !== id));
    }
  };

  useEffect(() => {
    if (d3Container.current) {
      // Example: Create a simple bar chart
      const svg = d3
        .select(d3Container.current)
        .append("svg")
        .attr("width", 160)
        .attr("height", 100);

      const data = [10, 20, 30, 40, 50];

      svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 30)
        .attr("y", (d) => 100 - d)
        .attr("width", 25)
        .attr("height", (d) => d)
        .attr("fill", "blue");
    }
  }, [data]);

  return (
    <div
      className=""
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
      <div ref={d3Container} className="d3-container"></div>
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
        {type !== "StartNode" && (
          <button className="node-delete-button" onClick={handleDelete}>
            <FontAwesomeIcon icon={faTrash} size="2xs" />
          </button>
        )}
      </div>
    </div>
  );
};

export default D3Node;
