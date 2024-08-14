import React, { useEffect, useContext } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import NodePanel from "./NodePanel";
import NodeConfigPopup from "./NodeConfigPopup";
import { getNodeTypes } from "../api/getNodeTypes";
import PopupMessage from "./PopupMessage";
import { getWorkflowById } from "../api/getWorkflowById";
import { WorkflowContext } from "../context/WorkflowContext";
import "./styles/workflowCanvas.css";

const WorkflowCanvas: React.FC = () => {
  const {
    initialStartNode,
    setWorkflowId,
    setNodes,
    setEdges,
    setNodeDefinitions,
    reactFlowWrapper,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setReactFlowInstance,
    onDragStart,
    onDrop,
    onDragOver,
    onNodeDoubleClick,
    nodeTypes,
    edgeTypes,
    connectionLineStyle,
    nodeDefinitions,
    selectedNode,
    setSelectedNode,
    executionStatus,
    executionErrors,
    setExecutionStatus,
    onNodesDelete,
    transformEdges,
  }: any = useContext(WorkflowContext);

  //useEffects
  useEffect(() => {
    // Extract the workflow ID from the URL
    const path = window.location.pathname;
    const parts = path.split("/");
    const id = parts[parts.length - 1]; // Get the last part of the path

    if (path.startsWith("/workflow/")) {
      setWorkflowId(id);
    }

    if (id != "new")
      getWorkflowById(id).then((response) => {
        console.log("Got workflowby id: Nodes", response.data.workflow.nodes);
        console.log("Got workflowby id: Edges", response.data.workflow.edges);

        setNodes(response.data.workflow.nodes);
        setEdges(transformEdges(response.data.workflow.edges));
      });
    else {
      setNodes([initialStartNode]);
      setEdges([]);
    }

    getNodeTypes()
      .then(setNodeDefinitions)
      .catch((error) => console.error("Error fetching node types:", error));
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{ height: "600px" }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          connectionLineStyle={connectionLineStyle}
          onNodesDelete={onNodesDelete}
        >
          <Controls position="top-right" />
          <Background />
          <MiniMap position="bottom-right" />
        </ReactFlow>
        <NodePanel nodeTypes={nodeDefinitions} onDragStart={onDragStart} />
        <div
          style={{
            display: "flex",
            position: "fixed",
            top: "20px",
            right: "20px",
            gap: "10px",
          }}
        ></div>
        {selectedNode &&
          selectedNode.type &&
          nodeDefinitions[selectedNode.type] && (
            <NodeConfigPopup
              node={selectedNode}
              nodeDefinition={
                nodeDefinitions[
                  selectedNode.type as keyof typeof nodeDefinitions
                ]
              }
              onClose={() => setSelectedNode(null)}
              onUpdate={(nodeId, newData) => {
                setNodes((nds: any) =>
                  nds.map((node: any) =>
                    node.id === nodeId
                      ? {
                          ...node,
                          data: {
                            ...node.data,
                            properties: {
                              ...node.data.properties,
                              ...newData.properties,
                            },
                          },
                        }
                      : node
                  )
                );
              }}
            />
          )}
        {executionStatus && (
          <PopupMessage
            message={executionStatus}
            type={
              executionErrors
                ? "error"
                : executionStatus.includes("completed successfully")
                ? "success"
                : "loading"
            }
            onClose={() => {
              setExecutionStatus(null);
              if (!executionErrors) {
              }
            }}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
};

export default WorkflowCanvas;
