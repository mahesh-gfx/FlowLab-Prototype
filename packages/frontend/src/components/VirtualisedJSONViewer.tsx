import React from "react";
import ReactJson from "react-json-view";
import AutoSizer from "react-virtualized-auto-sizer";

const JsonViewer: React.FC<any> = ({ data }: any) => {
  return (
    <div style={{ height: "300px", width: "100%" }}>
      <AutoSizer>
        {({ height, width }: any) => (
          <div style={{ height, width, overflow: "auto" }}>
            <ReactJson src={data} collapsed={true} />
          </div>
        )}
      </AutoSizer>
    </div>
  );
};

export default JsonViewer;
