import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Modal from "react-modal";
import DefaultNode from "./DefaultNode";

Modal.setAppElement("#root"); // Set the app element for accessibility

interface DataPoint {
  [key: string]: any;
}
const D3Node = ({ id, data, def, type }: any) => {
  const expandedChartRef = useRef<HTMLDivElement | null>(null);
  const miniChartRef = useRef<HTMLDivElement | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [hasOutputData, setHasOutputData] = useState(false);
  const [chartType, setChartType] = useState("scatter");
  const [labels, setLabels] = useState<Array<any>>([]);
  const [labelCategory, setLabelCategory] = useState("");

  const openModal = () => {
    setModalIsOpen(true);
    setTimeout(() => {
      renderExpandedChart();
    }, 100);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const downloadChart = (container: any) => {
    const svg = container?.querySelector("svg");
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

  // Effect to handle data updates
  useEffect(() => {
    if (data && data.output?.data?.json) {
      console.log("CHARTDATATATATATA: ", data.output.data.json.chartData);

      setChartType(data.properties?.chartType || "scatter");
      setLabelCategory(data.properties?.category || null);

      const uniqueLabels = new Set<string>(
        data.output.data.json.chartData.map(
          (item: any) => item[data.properties?.category || ""]
        )
      );

      setLabels(Array.from(uniqueLabels));
      // Clear previous chart
      if (expandedChartRef.current) {
        d3.select(expandedChartRef.current).selectAll("*").remove();
      }
      if (miniChartRef.current) {
        d3.select(miniChartRef.current).selectAll("*").remove();
      }

      setHasOutputData(!!data.output);
    }
  }, [JSON.stringify(data)]);

  // Effect to handle when all states are updated
  useEffect(() => {
    if (
      hasOutputData &&
      labels.length > 0 &&
      chartType &&
      data.output?.data?.json?.chartData
    ) {
      console.log(
        "Chart Data: ",
        data.output?.data?.json?.chartData,
        chartType
      );
      renderMiniChart();
    }
  }, [hasOutputData, labels, chartType]);

  function renderMiniChart() {
    switch (chartType) {
      case "scatter":
        renderScatterPlot(
          data?.output?.data?.json?.chartData,
          miniChartRef.current as HTMLElement,
          500,
          500
        );
        break;
      case "line":
        renderLineChart(
          data?.output?.data?.json?.chartData,
          miniChartRef.current as HTMLElement,
          500,
          500
        );
        break;
      case "bar":
        renderBarChart(
          data?.output?.data?.json?.chartData,
          miniChartRef.current as HTMLElement,
          500,
          500
        );
        break;
      default:
        console.error("Unsupported chart type:", data.chartType);
    }
  }
  function renderExpandedChart() {
    switch (chartType) {
      case "scatter":
        renderScatterPlot(
          data?.output?.data?.json?.chartData,
          expandedChartRef.current as HTMLElement,
          500,
          500
        );
        break;
      case "line":
        renderLineChart(
          data?.output?.data?.json?.chartData,
          expandedChartRef.current as HTMLElement,
          500,
          500
        );
        break;
      case "bar":
        renderBarChart(
          data?.output?.data?.json?.chartData,
          expandedChartRef.current as HTMLElement,
          500,
          500
        );
        break;
      default:
        console.error("Unsupported chart type:", data.chartType);
    }
  }

  function renderScatterPlot(
    data: DataPoint[],
    container: HTMLElement,
    renderWidth: number,
    renderHeight: number
  ) {
    // Clear previous SVG if any
    d3.select(container).selectAll("*").remove();

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", renderWidth)
      .attr("height", renderHeight)
      .attr("viewBox", `0 0 ${renderHeight} ${renderWidth}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "white");

    // Adjust margins for smaller containers
    const margin = { top: 10, right: 10, bottom: 30, left: 30 };
    const width = renderWidth - margin.left - margin.right;
    const height = renderHeight - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const xExtent = d3.extent(data, (d) => d.x);
    const yExtent = d3.extent(data, (d) => d.y);

    if (xExtent[0] !== undefined && xExtent[1] !== undefined) {
      x.domain(xExtent as [number, number]);
    }

    if (yExtent[0] !== undefined && yExtent[1] !== undefined) {
      y.domain(yExtent as [number, number]);
    }

    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(labels);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(Math.max(width / 30, 5))) // Increase ticks
      .selectAll("text")
      .style("font-size", "12px"); // Reduce font size

    g.append("g")
      .call(d3.axisLeft(y).ticks(Math.max(height / 30, 5))) // Increase ticks
      .selectAll("text")
      .style("font-size", "12px"); // Reduce font size

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
      .style("font-size", "10px") // Reduce tooltip font size
      .style("pointer-events", "none");

    g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 3.5)
      .attr("fill", (d) => color(d[labelCategory]))
      .on("mouseover", function (event, d) {
        tooltip
          .style("visibility", "visible")
          .text(`${JSON.stringify(d, null, 2)}`);
        d3.select(this).attr("r", 4); // Highlight point
      })
      .on("mousemove", function (event) {
        const [mouseX, mouseY] = d3.pointer(event);
        tooltip
          .style("top", `${mouseY + 15}px`)
          .style("left", `${mouseX + 15}px`);
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
        d3.select(this).attr("r", Math.max(1.5, Math.min(2.5, width / 50))); // Reset point size
      });
  }

  function renderLineChart(
    data: DataPoint[],
    container: HTMLElement,
    renderWidth: number,
    renderHeight: number
  ) {
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", renderWidth)
      .attr("height", renderHeight)
      .attr("viewBox", `0 0 ${renderHeight} ${renderWidth}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "white");

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = renderWidth - margin.left - margin.right;
    const height = renderHeight - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const xExtent = d3.extent(data, (d) => d.x);
    const yExtent = d3.extent(data, (d) => d.y);

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
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }

  const renderBarChart = (
    data: DataPoint[],
    container: HTMLElement,
    renderWidth: number,
    renderHeight: number
  ) => {
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", renderWidth)
      .attr("height", renderHeight)
      .attr("viewBox", `0 0 ${renderHeight} ${renderWidth}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "white");

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = renderWidth - margin.left - margin.right;
    const height = renderHeight - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.x.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y) || 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(labels);

    const g = svg.append("g");

    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d: DataPoint) => x(d.x.toString()) || 0)
      .attr("y", (d: DataPoint) => y(d.y))
      .attr("height", (d: DataPoint) => y(0) - y(d.y))
      .attr("width", x.bandwidth())
      .attr("fill", (d) => color(d[labelCategory]))
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
    <DefaultNode id={id} data={data} def={def} type={type}>
      {/* Add new features */}
      <div ref={miniChartRef} className="d3-mini-container"></div>
      {hasOutputData && (
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            margin: "8px 0",
          }}
        >
          <button
            onClick={openModal}
            className="button-small"
            style={{ margin: "5px" }}
          >
            Expand View
          </button>
          <button
            onClick={() => downloadChart(miniChartRef.current)}
            style={{ width: "max-content" }}
            className="button-small"
          >
            Download Chart
          </button>
        </div>
      )}
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
            display: "flex",
            flexDirection: "column",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          },
          overlay: {
            background: "rgba(128, 128, 128, 0.3)",
            backdropFilter: "blur(2px)",
            zIndex: 20,
          },
        }}
      >
        <h2>{data.label}</h2>
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => downloadChart(expandedChartRef.current)}
            style={{ width: "max-content" }}
            className="button"
          >
            Download Chart
          </button>
        </div>
        <div ref={expandedChartRef} className="d3-expanded-container"></div>
      </Modal>
    </DefaultNode>
  );
};

export default D3Node;
