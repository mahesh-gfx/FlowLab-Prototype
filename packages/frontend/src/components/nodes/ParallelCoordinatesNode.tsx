import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import DefaultNode from "./DefaultNode";
import Modal from "react-modal";

interface DataPoint {
  [key: string]: number | string;
}

const ParallelCoordinates = ({ id, data, def, type }: any) => {
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
    renderParallelCoordinates(
      data.output?.data?.json,
      data.properties?.variables,
      data.properties?.colorBy,
      miniChartRef.current,
      550,
      550
    );
  };
  const renderExpandedChart = () => {
    renderParallelCoordinates(
      data.output?.data?.json,
      data.properties?.variables,
      data.properties?.colorBy,
      expandedChartRef.current,
      550,
      550
    );
  };

  const renderParallelCoordinates = (
    data: DataPoint | any,
    variables: any,
    colorBy: any,
    container: any,
    renderWidth: number,
    renderHeight: number
  ) => {
    d3.select(container).selectAll("*").remove();

    const margin = { top: 30, right: 2, bottom: 10, left: 2 };
    const width = renderWidth - margin.left - margin.right;
    const height = renderHeight - margin.top - margin.bottom;

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
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${renderHeight} ${renderWidth}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().range([0, width]).padding(1).domain(varsToUse);
    const y: { [key: string]: d3.ScaleLinear<number, number> } = {};

    varsToUse.forEach((variable: any) => {
      //@ts-ignore
      y[variable] = d3
        .scaleLinear()
        .domain(d3.extent(data, (d: any) => d[variable]) as [any, any])
        .range([height, 0]);
    });

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    svg
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("d", (d) =>
        d3.line()(
          varsToUse.map((variable: any) => [
            x(variable),
            //@ts-ignore
            y[variable](d[variable] || 0),
          ])
        )
      )
      .style("fill", "none")
      .style("stroke", (d: any) => color(d[colorBy]))
      .style("opacity", 0.7);

    svg
      .selectAll("g")
      .data(varsToUse)
      .enter()
      .append("g")
      .attr("transform", (d: any) => `translate(${x(d)})`)
      .each(function (d: any) {
        //@ts-ignore
        d3.select(this).call(d3.axisLeft(y[d]));
      })
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text((d: any) => d)
      .style("fill", "black");
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

export default ParallelCoordinates;
