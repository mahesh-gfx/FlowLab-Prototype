import React, { useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";

const CustomHandle = ({ ...props }: any) => {
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    updateNodeInternals(props.nodeId);
  }, [props.position]);
  return <Handle {...props} />;
};

export default CustomHandle;
