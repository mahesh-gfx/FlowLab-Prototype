import React, { useState, useEffect } from "react";
import { Column, Table } from "react-virtualized";
import Draggable from "react-draggable";
import "react-virtualized/styles.css";
import "./styles/virtualizedTable.css";

interface VirtualizedTableProps {
  data: Record<string, any>[];
}

const TOTAL_WIDTH = 800; // Adjust this value as needed

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({ data }) => {
  const [columns, setColumns] = useState<string[]>([]);
  const [widths, setWidths] = useState<Record<string, number>>({});

  useEffect(() => {
    if (data.length > 0) {
      const cols = Object.keys(data[0]);
      setColumns(cols);
      const initialWidths = cols.reduce((acc, col) => {
        acc[col] = 1 / cols.length;
        return acc;
      }, {} as Record<string, number>);
      setWidths(initialWidths);
    }
  }, [data]);

  const headerRenderer = ({
    columnData,
    dataKey,
    disableSort,
    label,
    sortBy,
    sortDirection,
  }: any) => {
    return (
      <React.Fragment key={dataKey}>
        <div className="ReactVirtualized__Table__headerTruncatedText">
          {label}
        </div>
        <Draggable
          axis="x"
          defaultClassName="DragHandle"
          defaultClassNameDragging="DragHandleActive"
          onDrag={(event, { deltaX }) =>
            resizeRow({
              dataKey,
              deltaX,
            })
          }
        >
          <span className="DragHandleIcon">⋮</span>
        </Draggable>
      </React.Fragment>
    );
  };

  const resizeRow = ({
    dataKey,
    deltaX,
  }: {
    dataKey: string;
    deltaX: number;
  }) =>
    setWidths((prevWidths) => {
      const percentDelta = deltaX / TOTAL_WIDTH;
      const nextDataKey =
        columns[(columns.indexOf(dataKey) + 1) % columns.length];

      return {
        ...prevWidths,
        [dataKey]: Math.max(0.1, prevWidths[dataKey] + percentDelta),
        [nextDataKey]: Math.max(0.1, prevWidths[nextDataKey] - percentDelta),
      };
    });

  return (
    <Table
      width={TOTAL_WIDTH}
      height={400}
      headerHeight={20}
      rowHeight={30}
      rowCount={data.length}
      rowGetter={({ index }) => data[index]}
    >
      {columns.map((column) => (
        <Column
          key={column}
          headerRenderer={headerRenderer}
          dataKey={column}
          label={column}
          width={widths[column] * TOTAL_WIDTH}
        />
      ))}
    </Table>
  );
};

export default VirtualizedTable;
