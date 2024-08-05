import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  NodeProps,
  Handle,
  Position,
  ReactFlowInstance,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  WorkflowStructure,
  NodeData,
  WorkflowNode,
  WorkflowEdge,
  NodeProperty,
} from "@data-viz-tool/shared";
import { StartNode } from "@data-viz-tool/nodes";
import NodePanel from "./NodePanel";
import NodeConfigPopup from "./NodeConfigPopup";
import { getNodeTypes } from "../api/getNodeTypes";
import { executeWorkflow } from "../api/executeWorkflow";
import PopupMessage from "./PopupMessage";
import { saveAs } from "file-saver";
import "./styles/workflowCanvas.css";
import LogoutButton from "./LogoutButton";
import { getWorkflowById } from "../api/getWorkflowById";

interface NodeDefinition {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  inputs: string[];
  outputs: string[];
  properties: NodeProperty[];
  version: number;
}

interface ExecutionResult {
  [nodeId: string]: any;
}

interface ExecutionError {
  nodeId: string;
  error: string;
}

const WorkflowCanvas: React.FC = () => {
  const initialStartNode: Node<NodeData> = {
    id: "start-node",
    type: "StartNode",
    position: { x: 100, y: 100 },
    data: {
      label: "Start",
      type: "StartNode",
      properties: StartNode.getNodeDefinition().properties.reduce(
        (acc, prop) => {
          acc[prop.name] = prop.default;
          return acc;
        },
        {} as Record<string, any>
      ),
    },
  };

  const [nodes, setNodes, onNodesChange] = useNodesState([initialStartNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [nodeDefinitions, setNodeDefinitions] = useState<
    Record<string, NodeDefinition>
  >({});
  const [executionResults, setExecutionResults] = useState<ExecutionResult>([]);
  const [executionErrors, setExecutionErrors] = useState<
    ExecutionError[] | null
  >(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);

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
        setEdges(response.data.workflow.edges);
      });

    getNodeTypes()
      .then(setNodeDefinitions)
      .catch((error) => console.error("Error fetching node types:", error));
  }, []);

  const nodeTypes = React.useMemo(() => {
    return Object.entries(nodeDefinitions).reduce((acc, [key, def]) => {
      acc[key] = React.memo((props: NodeProps<NodeData>) => {
        const { data } = props;
        return (
          <div
            className="react-flow__node-default"
            style={{
              padding: "10px",
              borderRadius: "3px",
              width: 180,
              fontSize: "12px",
              backgroundColor: def.color,
            }}
          >
            {def.inputs.map((input, index) => (
              <Handle
                key={`input-${index}`}
                type="target"
                position={Position.Left}
                id={input}
                style={{
                  top: `${((index + 1) / (def.inputs.length + 1)) * 100}%`,
                }}
              />
            ))}
            <div style={{ fontWeight: "bold" }}>{data.label}</div>
            {data.error && <div className="node-error-symbol" />}
            {data.error && (
              <div
                className="node-error"
                style={{ color: "red", fontSize: "10px" }}
              >
                {data.error}
              </div>
            )}
            {def.outputs.map((output, index) => (
              <Handle
                key={`output-${index}`}
                type="source"
                position={Position.Right}
                id={output}
                style={{
                  top: `${((index + 1) / (def.outputs.length + 1)) * 100}%`,
                }}
              />
            ))}
          </div>
        );
      });
      return acc;
    }, {} as Record<string, React.ComponentType<NodeProps<NodeData>>>);
  }, [nodeDefinitions]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (reactFlowWrapper.current && reactFlowInstance) {
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData("application/reactflow");

        // Prevent adding multiple start nodes
        if (
          type === "StartNode" &&
          nodes.some((node) => node.type === "StartNode")
        ) {
          console.warn("A start node already exists in the workflow.");
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeDefinition = nodeDefinitions[type];
        const newNode: Node<NodeData> = {
          id: `${type}-${nodes.length + 1}`,
          type,
          position,
          data: {
            label: nodeDefinition.displayName,
            type,
            properties: nodeDefinition.properties.reduce((acc, prop) => {
              acc[prop.name] = prop.default;
              return acc;
            }, {} as Record<string, any>),
          },
        };
        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, nodes, setNodes, nodeDefinitions]
  );

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node<NodeData>) => {
      setSelectedNode(node);
    },
    []
  );

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: string) => {
      event.dataTransfer.setData("application/reactflow", nodeType);
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const mapToWorkflowNode = (node: Node<NodeData>): WorkflowNode => ({
    ...node,
    type: node.type || "",
  });

  const mapToWorkflowEdge = (edge: Edge): WorkflowEdge => ({
    ...edge,
    sourceHandle: edge.sourceHandle || undefined,
    targetHandle: edge.targetHandle || undefined,
  });

  const onExport = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const workflowData: WorkflowStructure = {
        nodes: flow.nodes.map(mapToWorkflowNode),
        edges: flow.edges.map(mapToWorkflowEdge),
      };
      const json = JSON.stringify(workflowData, null, 2);
      console.log(json);
      const blob = new Blob([json], { type: "application/json" });
      saveAs(blob, "workflow.json");
    }
  }, [reactFlowInstance]);

  const onImport = useCallback(
    (importedData: string) => {
      try {
        const { nodes: importedNodes, edges: importedEdges } = JSON.parse(
          importedData
        ) as WorkflowStructure;
        setNodes(
          importedNodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              properties: node.data.properties || {},
            },
          }))
        );
        setEdges(importedEdges);
      } catch (error) {
        console.error("Failed to import workflow:", error);
      }
    },
    [setNodes, setEdges]
  );

  const getConnectedNodes = (nodes: Node[], edges: Edge[]): Set<string> => {
    const connectedNodes = new Set<string>();
    const startNodes = nodes.filter((node) => node.type === "StartNode");

    const traverse = (nodeId: string) => {
      if (connectedNodes.has(nodeId)) return;
      connectedNodes.add(nodeId);

      edges.forEach((edge) => {
        if (edge.source === nodeId) {
          traverse(edge.target);
        }
      });
    };

    startNodes.forEach((node) => traverse(node.id));
    return connectedNodes;
  };

  const handleNodeExecuted = (data: { nodeId: string; output: any }) => {
    console.log("Node executed in WorkflowCanvas", data);

    setExecutionResults((prevResults) => ({
      ...prevResults,
      [data.nodeId]: data.output,
    }));

    // Update the node data with the execution result
    setNodes((nds) =>
      nds.map((node) =>
        node.id === data.nodeId
          ? { ...node, data: { ...node.data, output: data.output } }
          : node
      )
    );
  };

  const handleNodeError = (data: { nodeId: string; error: string }) => {
    setExecutionResults((prevResults) => ({
      ...prevResults,
      [data.nodeId]: { error: data.error },
    }));

    // Update the node data with the error
    setNodes((nds) =>
      nds.map((node) =>
        node.id === data.nodeId
          ? { ...node, data: { ...node.data, error: data.error } }
          : node
      )
    );

    setExecutionErrors([{ nodeId: data.nodeId, error: data.error }]);
    setIsExecuting(false);
    setExecutionStatus(`Execution failed: Error in node: ${data.nodeId}`);
  };

  const handleWorkflowCompleted = (state: boolean) => {
    console.log("Workflow execution completed");
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          executionResult: executionResults[node.id],
        },
      }))
    );
    setIsExecuting(false);
    if (state)
      setExecutionStatus("Workflow execution completed successfully...");
    else {
      setExecutionStatus("Workflow execution failed!");
    }
  };

  const startWorkflowExecutionV2 = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const connectedNodeIds = getConnectedNodes(flow.nodes, flow.edges);

      const workflowData: WorkflowStructure = {
        nodes: flow.nodes
          .filter((node) => connectedNodeIds.has(node.id))
          .map(mapToWorkflowNode),
        edges: flow.edges
          .filter(
            (edge) =>
              connectedNodeIds.has(edge.source) &&
              connectedNodeIds.has(edge.target)
          )
          .map(mapToWorkflowEdge),
      };
      try {
        setExecutionResults([]); // Reset results before starting new execution
        setIsExecuting(true);
        setExecutionStatus("Executing workflow...");
        console.log("Executionresults: ", executionResults);
        executeWorkflow(
          workflowData,
          handleNodeExecuted,
          handleNodeError,
          handleWorkflowCompleted
        );
      } catch (error: any) {
        console.error("Workflow execution failed:", error);
        setExecutionErrors([{ nodeId: "global", error: error.message }]);
        setIsExecuting(false);
        setExecutionStatus("Workflow execution failed.");
      }
    }
  }, [reactFlowInstance, setNodes]);

  return (
    <ReactFlowProvider>
      <LogoutButton />
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
          fitView
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
        >
          <button onClick={onExport}>Export Workflow</button>
          <label htmlFor="import-workflow">Import Workflow</label>
          <input
            type="file"
            id="import-workflow"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    onImport(event.target.result as string);
                  }
                };
                reader.readAsText(file);
              }
            }}
          />
          <button
            onClick={startWorkflowExecutionV2}
            disabled={isExecuting}
            style={{
              opacity: isExecuting ? 0.5 : 1,
              cursor: isExecuting ? "not-allowed" : "pointer",
            }}
          >
            {isExecuting ? "Executing workflow..." : "Execute Workflow"}
          </button>
        </div>
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
                setNodes((nds) =>
                  nds.map((node) =>
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
