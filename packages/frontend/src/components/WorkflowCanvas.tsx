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
    type: "startNode",
    position: { x: 100, y: 100 },
    data: {
      label: "Start",
      type: "startNode",
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
                {JSON.stringify(data.properties[prop.name] || prop.default)}
              </div>
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
                  {JSON.stringify(data.properties[prop.name] || prop.default)}
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
        console.log("Type: ", type);

        // Prevent adding multiple start nodes
        if (
          type === "startNode" &&
          nodes.some((node) => node.type === "startNode")
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
      // You can save this JSON to a file or send it to the server
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

  const onExecuteWorkflow = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const workflowData: WorkflowStructure = {
        nodes: flow.nodes.map(mapToWorkflowNode),
        edges: flow.edges.map(mapToWorkflowEdge),
      };
      executeWorkflow(workflowData)
        .then((response) => {
          console.log("Workflow execution response:", response);
          if (response.result) {
            setExecutionResults(response.result);
          }
          if (response.errors) {
            setExecutionErrors(response.errors);
          }
        })
        .catch((error) => {
          console.error("Workflow execution failed:", error);
          setExecutionErrors([{ nodeId: "global", error: error.message }]);
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
          <button onClick={onExecuteWorkflow}>Execute Workflow</button>
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
        {executionErrors && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              background: "red",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <h3>Execution Errors:</h3>
            <ul>
              {executionErrors.map((error, index) => (
                <li key={index}>
                  {error.nodeId}: {error.error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
};

export default WorkflowCanvas;
