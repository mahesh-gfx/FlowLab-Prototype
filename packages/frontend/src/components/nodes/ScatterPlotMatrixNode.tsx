import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import DefaultNode from "./DefaultNode";
import Modal from "react-modal";

const ScatterPlotMatrixNode = ({ id, data, def, type }: any) => {
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

  // Effect to handle data updates
  useEffect(() => {
    if (data && data.output?.data?.json) {
      // Clear previous chart
      if (expandedChartRef.current) {
        d3.select(expandedChartRef.current).selectAll("*").remove();
      }
      if (miniChartRef.current) {
        d3.select(miniChartRef.current).selectAll("*").remove();
      }

      setHasOutputData(!!data.output);
      if (data) {
        renderMiniChart();
        console.log("Rendered a scatterplot matrix miniChart");
      }
    }
  }, [JSON.stringify(data)]);

  const renderScatterPlotMatrix = (
    data: any,
    variables: any,
    colorBy: any,
    container: any,
    renderWidth: number,
    renderHeight: number
  ) => {
    // Clear previous SVG
    d3.select(container).selectAll("*").remove();

    const size = 200; // Size of each scatter plot
    const padding = 20; // Padding between plots

    // Determine variables to use
    const variablesArray = variables
      ? variables
          .split(",")
          .map((v: any) => v.trim())
          .filter((v: any) => v)
      : Object.keys(data[0]);

    // Use all variables if the list is empty
    const varsToUse =
      variablesArray.length > 0 ? variablesArray : Object.keys(data[0]);

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", renderWidth)
      .attr("height", renderHeight)
      .attr("viewBox", `0 0 ${renderHeight} ${renderWidth}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "white");

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Adjust margins for smaller containers
    const margin = { top: 10, right: 10, bottom: 30, left: 30 };
    const width = renderWidth - margin.left - margin.right;
    const height = renderHeight - margin.top - margin.bottom;

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

    varsToUse.forEach((xVar: any, i: any) => {
      varsToUse.forEach((yVar: any, j: any) => {
        const g = svg
          .append("g")
          .attr(
            "transform",
            `translate(${i * size + i * padding},${j * size + j * padding})`
          );

        const xExtent = d3.extent(data, (d: any) => d[xVar]);
        const yExtent = d3.extent(data, (d: any) => d[yVar]);

        const x = d3
          .scaleLinear()
          .domain(xExtent as [any, any])
          .range([padding / 2, size - padding / 2]);

        const y = d3
          .scaleLinear()
          .domain(yExtent as [any, any])
          .range([size - padding / 2, padding / 2]);

        g.append("rect")
          .attr("fill", "none")
          .attr("stroke", "#aaa")
          .attr("width", size)
          .attr("height", size);

        g.selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", (d: any) => x(d[xVar]))
          .attr("cy", (d: any) => y(d[yVar]))
          .attr("r", 3)
          .attr("fill", (d: any) => color(d[colorBy]))
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

        if (i === j) {
          g.append("text")
            .attr("x", size / 2)
            .attr("y", size / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(xVar);
        }
      });
    });
  };

  const renderMiniChart = () => {
    renderScatterPlotMatrix(
      data.output?.data?.json,
      data.properties?.variables,
      data.properties?.colorBy,
      miniChartRef.current,
      600,
      600
    );
  };
  const renderExpandedChart = () => {
    renderScatterPlotMatrix(
      data.output?.data?.json,
      data.properties?.variables,
      data.properties?.colorBy,
      expandedChartRef.current,
      600,
      600
    );
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

export default ScatterPlotMatrixNode;
