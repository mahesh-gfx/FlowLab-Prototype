import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import DefaultNode from "./DefaultNode";
import Modal from "react-modal";

const CorrelationHeatmap = ({ id, data, def, type }: any) => {
  const expandedChartRef = useRef<HTMLDivElement | null>(null);
  const miniChartRef = useRef<HTMLDivElement | null>(null);
  const [hasOutputData, setHasOutputData] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
    setTimeout(() => {
      renderExpandedChart();
      console.log("Rendered a scatterplot matrix expanded chart");
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

  useEffect(() => {
    if (data && data.output?.data?.json) {
      setHasOutputData(!!data.output);
      renderMiniChart();

      console.log("Rendering a parallel coordinate plot mini");
    }
  }, [JSON.stringify(data)]);

  const renderMiniChart = () => {
    renderCorrelationHeatmap(
      data.output?.data?.json,
      miniChartRef.current,
      550,
      550
    );
  };
  const renderExpandedChart = () => {
    renderCorrelationHeatmap(
      data.output?.data?.json,
      expandedChartRef.current,
      550,
      550
    );
  };

  const renderCorrelationHeatmap = (
    correlationData: any,
    container: any,
    renderWidth: number,
    renderHeight: number
  ) => {
    d3.select(container).selectAll("*").remove();

    const margin = { top: 50, right: 80, bottom: 30, left: 80 };
    const width = renderWidth - margin.left - margin.right;
    const height = renderHeight - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${renderWidth} ${renderHeight}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(correlationData.map((d: any) => d.x))
      .padding(0.01);
    const y = d3
      .scaleBand()
      .range([height, 0])
      .domain(correlationData.map((d: any) => d.y))
      .padding(0.01);

    const color = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]);

    // Add correlation rectangles
    svg
      .selectAll("rect")
      .data(correlationData)
      .enter()
      .append("rect")
      .attr("x", (d: any) => x(d.x) as any)
      .attr("y", (d: any) => y(d.y) as any)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", (d: any) => color(d.correlation));

    // Add correlation text
    svg
      .selectAll("text")
      .data(correlationData)
      .enter()
      .append("text")
      .attr("x", (d: any) => (x(d.x as any) as any) + x.bandwidth() / 2)
      .attr("y", (d: any) => (y(d.y as any) as any) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "10px")
      .text((d: any) => d.correlation.toFixed(2));

    svg
      .append("g")
      .call(d3.axisBottom(x))
      .attr("transform", `translate(0,${height})`);
    svg.append("g").call(d3.axisLeft(y));

    // Add color scale legend
    const legendWidth = 20;
    const legendHeight = height;
    const legendSvg = svg
      .append("g")
      .attr("transform", `translate(${width + 10}, 0)`);

    const legend = legendSvg
      .append("defs")
      .append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%")
      .attr("spreadMethod", "pad");

    legend
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color(-1))
      .attr("stop-opacity", 1);

    legend
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color(1))
      .attr("stop-opacity", 1);

    legendSvg
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#gradient)");

    const legendScale = d3
      .scaleLinear()
      .range([legendHeight, 0])
      .domain([-1, 1]);

    legendSvg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(d3.axisRight(legendScale).ticks(5));
  };

  return (
    <DefaultNode id={id} data={data} def={def} type={type}>
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

export default CorrelationHeatmap;
