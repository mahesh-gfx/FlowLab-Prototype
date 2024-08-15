import React from "react";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";

interface VirtualizedTableProps {
  data: Record<string, any>[];
}

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({ data }) => {
  // Utility function to calculate the width of a column based on text length
  const calculateColumnWidth = (header: string, data: string[]): number => {
    const maxLength = Math.max(
      header.length,
      ...data.map((item) => item.length)
    );
    return Math.min(Math.max(maxLength * 10, 100), 300); // Set min and max width
  };

  // Define columns based on the data keys
  const columns: GridColDef[] = Object.keys(data[0] || {}).map((key) => ({
    field: key,
    headerName: key,
    width: calculateColumnWidth(
      key,
      data.map((row) => String(row[key]))
    ),
  }));

  // Map data to rows with an id
  const rows: GridRowsProp = data.map((row, index) => ({ id: index, ...row }));

  return (
    <div style={{ height: 380, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        autoPageSize
        columnBufferPx={25}
        rowBufferPx={25}
      />
    </div>
  );
};

export default VirtualizedTable;
