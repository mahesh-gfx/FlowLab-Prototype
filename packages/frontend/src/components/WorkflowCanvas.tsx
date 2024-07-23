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
  NodeChange,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  WorkflowStructure,
  NodeData,
  WorkflowNode,
  WorkflowEdge,
} from "@data-viz-tool/shared";
import { StartNode } from "@data-viz-tool/nodes";
import NodePanel from "./NodePanel";
import NodeConfigPopup from "./NodeConfigPopup";
import { getNodeTypes } from "../api/getNodeTypes";
import { executeWorkflow } from "../api/executeWorkflow";
import { saveAs } from "file-saver";
import PopupMessage from "./PopupMessage";

interface NodeDefinition {
  inputs: string[];
  outputs: string[];
  properties: Array<{
    name: string;
    displayName: string;
    type: string;
    default: any;
  }>;
  displayName: string;
  color: string;
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
  const [executionResults, setExecutionResults] =
    useState<ExecutionResult | null>(null);
  const [executionErrors, setExecutionErrors] = useState<
    ExecutionError[] | null
  >(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);

  useEffect(() => {
    getNodeTypes()
      .then(setNodeDefinitions)
      .catch((error) => console.error("Error fetching node types:", error));
  }, []);

  const nodeTypes = React.useMemo(() => {
    return {
      StartNode: React.memo((props: NodeProps<NodeData>) => {
        const { data } = props;
        const def = StartNode.getNodeDefinition();
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
            <div style={{ fontWeight: "bold" }}>{data.label}</div>
            {def.properties.map((prop) => (
              <div key={prop.name}>
                <strong>{prop.displayName}:</strong>{" "}
                {JSON.stringify(
                  data.properties?.[prop.name] ?? prop.default ?? ""
                )}
              </div>
            ))}
            {def.inputs.map((input, index) => (
              <Handle
                key={`input-${index}`}
                type="target"
                position={Position.Left}
                id={input}
                style={{ top: `${(index + 1) * 25}%` }}
              />
            ))}
            {def.outputs.map((output, index) => (
              <Handle
                key={`output-${index}`}
                type="source"
                position={Position.Right}
                id={output}
                style={{ top: `${(index + 1) * 25}%` }}
              />
            ))}
          </div>
        );
      }),
      ...Object.entries(nodeDefinitions).reduce((acc, [key, def]) => {
        acc[key] = React.memo((props: NodeProps<NodeData>) => {
          const { data, id } = props;
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
                  style={{ top: `${(index + 1) * 25}%` }}
                />
              ))}
              <div style={{ fontWeight: "bold" }}>{data.label}</div>
              {def.properties.map((prop) => (
                <div key={prop.name}>
                  <strong>{prop.displayName}:</strong>{" "}
                  {JSON.stringify(
                    data.properties?.[prop.name] ?? prop.default ?? ""
                  )}
                </div>
              ))}
              {executionResults && executionResults[props.id] && (
                <div>
                  <strong>Result:</strong>{" "}
                  {JSON.stringify(executionResults[props.id])}
                </div>
              )}
              {def.outputs.map((output, index) => (
                <Handle
                  key={`output-${index}`}
                  type="source"
                  position={Position.Right}
                  id={output}
                  style={{ top: `${(index + 1) * 25}%` }}
                />
              ))}
              {id !== "start-node" && (
                <button
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setNodes((nds) => nds.filter((node) => node.id !== id))
                  }
                >
                  X
                </button>
              )}
            </div>
          );
        });
        return acc;
      }, {} as Record<string, React.ComponentType<NodeProps<NodeData>>>),
    };
  }, [nodeDefinitions, executionResults, setNodes]);

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
        // console.log("Type: ", type);
        // console.log("Event: ", event);

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
            label: nodeDefinition.displayName || type,
            type,
            properties: nodeDefinition.properties.reduce<Record<string, any>>(
              (acc, prop) => {
                acc[prop.name] = prop.default;
                return acc;
              },
              {}
            ),
          },
        };
        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, nodes, setNodes, nodeDefinitions]
  );

  const onNodesChangeCustom = useCallback(
    (changes: NodeChange | any) => {
      const filteredChanges = changes.filter(
        (change: NodeChange) =>
          !(change.type === "remove" && change.id === "start-node")
      );
      onNodesChange(filteredChanges);
    },
    [onNodesChange]
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
    type: node.type || "", // Ensure type is always a string
  });

  const mapToWorkflowEdge = (edge: Edge): WorkflowEdge => ({
    ...edge,
    sourceHandle: edge.sourceHandle || undefined, // Convert null to undefined
    targetHandle: edge.targetHandle || undefined, // Convert null to undefined
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

  const onExecuteWorkflow = useCallback(() => {
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

      setIsExecuting(true);
      executeWorkflow(workflowData)
        .then((response) => {
          console.log("Workflow execution response:", response);
          if (response.result) {
            setExecutionResults(response.result);
            setIsExecuting(false);
          }
          if (response.errors) {
            setExecutionErrors(response.errors);
            setIsExecuting(false);
          }
        })
        .catch((error) => {
          console.error("Workflow execution failed:", error);
          setExecutionErrors([{ nodeId: "global", error: error.message }]);
          setIsExecuting(false);
        });
    }
  }, [reactFlowInstance]);

  return (
    <ReactFlowProvider>
      <div style={{ height: "600px" }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeCustom}
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
            onClick={onExecuteWorkflow}
            disabled={isExecuting}
            style={{
              opacity: isExecuting ? 0.5 : 1,
              cursor: isExecuting ? "not-allowed" : "pointer",
            }}
          >
            {isExecuting ? "Executing workflow..." : "Execute Workflow"}
          </button>
        </div>
        {selectedNode && (
          <NodeConfigPopup
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={(nodeId, newData) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === nodeId
                    ? { ...node, data: { ...node.data, ...newData } }
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
