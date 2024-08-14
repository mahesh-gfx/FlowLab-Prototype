import { useContext, useEffect, useRef, useState } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Handle, Position, useReactFlow, EdgeLabelRenderer } from "reactflow";
import * as d3 from "d3";
import Modal from "react-modal";
import { WorkflowContext } from "../../context/WorkflowContext";

Modal.setAppElement("#root"); // Set the app element for accessibility

interface DataPoint {
  x: number;
  y: number;
  category: string;
}

const D3Node = ({ id, data, def, type }: any) => {
  const { setNodes } = useReactFlow();
  const expandedChartRef = useRef<HTMLDivElement | null>(null);
  const miniChartRef = useRef<HTMLDivElement | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [hasOutputData, setHasOutputData] = useState(false);

  const { deleteNodeById } = useContext(WorkflowContext);

  const handleDelete = () => {
    deleteNodeById(id);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const downloadChart = () => {
    const svg = expandedChartRef.current?.querySelector("svg");
    if (svg) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const a = document.createElement("a");
      a.href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
      a.download = `${data.label}-chart.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  useEffect(() => {
    if (data) {
      // Clear previous chart
      d3.select(expandedChartRef.current).selectAll("*").remove();
      d3.select(miniChartRef.current).selectAll("*").remove();

      // Render the chart based on the chartType
      if (data?.output) {
        setHasOutputData(true);
        switch (data?.properties?.chartType) {
          case "scatter":
            renderScatterPlot(
              data?.output?.data?.json,
              miniChartRef.current as HTMLElement,
              100,
              100
            );
            renderScatterPlot(
              data?.output?.data?.json,
              expandedChartRef.current as HTMLElement,
              500,
              500
            );
            break;
          case "line":
            renderLineChart(
              data?.output?.data?.json,
              miniChartRef.current as HTMLElement,
              100,
              100
            );
            renderLineChart(
              data?.output?.data?.json,
              expandedChartRef.current as HTMLElement,
              500,
              500
            );
            break;
          case "bar":
            renderBarChart(
              data?.output?.data?.json,
              miniChartRef.current as HTMLElement,
              500,
              500
            );
            renderBarChart(
              data?.output?.data?.json,
              expandedChartRef.current as HTMLElement,
              500,
              500
            );
            break;
          default:
            console.error("Unsupported chart type:", data.chartType);
        }
      } else setHasOutputData(false);
    }
  }, [JSON.stringify(data)]);

  function renderScatterPlot(
    data: { data: DataPoint[]; labels: string[] },
    container: HTMLElement,
    renderWidth: number,
    renderHeight: number
  ) {
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", renderWidth)
      .attr("height", renderHeight)
      .style("background-color", "white");

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = renderWidth - margin.left - margin.right;
    const height = renderHeight - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const xExtent = d3.extent(data.data, (d) => d.x);
    const yExtent = d3.extent(data.data, (d) => d.y);

    if (xExtent[0] !== undefined && xExtent[1] !== undefined) {
      x.domain(xExtent as [number, number]);
    }

    if (yExtent[0] !== undefined && yExtent[1] !== undefined) {
      y.domain(yExtent as [number, number]);
    }

    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(data.labels);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g").call(d3.axisLeft(y));

    // Add tooltip
    const tooltip = d3
      .select(container)
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("border", "1px solid #d3d3d3")
      .style("padding", "5px")
      .style("border-radius", "3px")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    g.selectAll(".dot")
      .data(data.data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 3.5)
      .attr("fill", (d) => color(d.category))
      .on("mouseover", function (event, d) {
        tooltip
          .style("visibility", "visible")
          .text(`x: ${d.x}, y: ${d.y}, category: ${d.category}`);
        d3.select(this).attr("r", 5); // Highlight point
      })
      .on("mousemove", function (event) {
        const [mouseX, mouseY] = d3.pointer(event);
        tooltip
          .style("top", `${mouseY + 15}px`)
          .style("left", `${mouseX + 15}px`);
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
        d3.select(this).attr("r", 3.5); // Reset point size
      });
  }

  function renderLineChart(
    data: { data: DataPoint[]; labels: string[] },
    container: HTMLElement,
    renderWidth: number,
    renderHeight: number
  ) {
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", renderWidth)
      .attr("height", renderHeight)
      .style("background-color", "white");

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = renderWidth - margin.left - margin.right;
    const height = renderHeight - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const xExtent = d3.extent(data.data, (d) => d.x);
    const yExtent = d3.extent(data.data, (d) => d.y);

    if (xExtent[0] !== undefined && xExtent[1] !== undefined) {
      x.domain(xExtent as [number, number]);
    }

    if (yExtent[0] !== undefined && yExtent[1] !== undefined) {
      y.domain(yExtent as [number, number]);
    }

    const line = d3
      .line<DataPoint>()
      .x((d) => x(d.x))
      .y((d) => y(d.y));

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g").call(d3.axisLeft(y));

    g.append("path")
      .datum(data.data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }

  const renderBarChart = (
    data: { data: DataPoint[]; labels: string[] },
    container: HTMLElement,
    renderWidth: number,
    renderHeight: number
  ) => {
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", renderWidth)
      .attr("height", renderHeight)
      .style("background-color", "white");

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = renderWidth - margin.left - margin.right;
    const height = renderHeight - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(data.data.map((d) => d.x.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data.data, (d) => d.y) || 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(data.labels);

    const g = svg.append("g");

    g.selectAll("rect")
      .data(data.data)
      .enter()
      .append("rect")
      .attr("x", (d: DataPoint) => x(d.x.toString()) || 0)
      .attr("y", (d: DataPoint) => y(d.y))
      .attr("height", (d: DataPoint) => y(0) - y(d.y))
      .attr("width", x.bandwidth())
      .attr("fill", (d) => color(d.category))
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.7); // Highlight bar
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1); // Reset bar opacity
      });

    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  };

  return (
    <div
      className="react-flow__node-default 3-node"
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
      <div ref={miniChartRef} className="d3-mini-container"></div>
      {hasOutputData && (
        <button onClick={openModal} style={{ marginTop: "10px" }}>
          Expand View
        </button>
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
        {type !== "StartNode" && (
          <button className="node-delete-button" onClick={handleDelete}>
            <FontAwesomeIcon icon={faTrash} size="2xs" />
          </button>
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Expanded Chart View"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
          },
        }}
      >
        <h2>{data.label}</h2>
        <div ref={expandedChartRef} className="d3-expanded-container"></div>
        <button onClick={downloadChart}>Download Chart</button>
        <button onClick={closeModal} style={{ marginLeft: "10px" }}>
          Close
        </button>
      </Modal>
    </div>
  );
};

export default D3Node;
