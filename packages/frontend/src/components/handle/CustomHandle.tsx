import React, { useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";

const CustomHandle = ({ nodeId, type, position, style }: any) => {
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [position]);
  return (
    <Handle
      type={type}
      position={position}
      style={{
        ...style,
      }}
    />
  );
};

export default CustomHandle;
