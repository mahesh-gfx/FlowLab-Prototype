import React, { useState, useCallback, useRef } from "react";
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
} from "reactflow";
import "reactflow/dist/style.css";
import { WorkflowStructure, NodeData } from "@data-viz-tool/shared";
import * as nodeModules from "@data-viz-tool/nodes";
import NodePanel from "./NodePanel";
import NodeConfigPopup from "./NodeConfigPopup";
import { executeWorkflow } from "../api/executeWorkflow";
import { getNodeTypes } from "../api/getNodeTypes";
import { getNodeConfig } from "../api/getNodeConfig";

// Create wrapper components for node classes
const nodeTypes = Object.entries(nodeModules).reduce(
  (acc, [key, NodeClass]) => {
    if (typeof NodeClass === "function" && key !== "BaseNode") {
      acc[key] = React.memo((props: NodeProps) => {
        const { data } = props;
        return (
          <div
            className="react-flow__node-default"
            style={{
              padding: "10px",
              borderRadius: "3px",
              width: 150,
              fontSize: "12px",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{data.label}</div>
            {Object.entries(data).map(
              ([key, value]) =>
                key !== "label" && (
                  <div key={key}>
                    <strong>{key}:</strong> {JSON.stringify(value)}
                  </div>
                )
            )}
          </div>
        );
      });
    }
    return acc;
  },
  {} as Record<string, React.ComponentType<NodeProps>>
);

const WorkflowCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [availableNodeTypes, setAvailableNodeTypes] = useState<string[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (reactFlowWrapper.current && reactFlowInstance) {
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData("application/reactflow");
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        getNodeConfig(type).then((config) => {
          const newNode: Node<NodeData> = {
            id: `${type}-${nodes.length + 1}`,
            type,
            position,
            data: { ...config, type, label: config.label || type },
          };
          setNodes((nds) => nds.concat(newNode));
        });
      }
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node<NodeData>) => {
      setSelectedNode(node);
    },
    []
  );

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onExport = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const workflowData: WorkflowStructure = {
        nodes: flow.nodes,
        edges: flow.edges,
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
        setNodes(importedNodes);
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
        nodes: flow.nodes,
        edges: flow.edges,
      };
      executeWorkflow(workflowData)
        .then((result) => {
          console.log("Workflow execution result:", result);
          // Update nodes with results
          setNodes((nds) =>
            nds.map((node) => ({
              ...node,
              data: {
                ...node.data,
                result: result[node.id],
              },
            }))
          );
        })
        .catch((error) => {
          console.error("Workflow execution failed:", error);
        });
    }
  }, [reactFlowInstance, setNodes]);

  React.useEffect(() => {
    getNodeTypes().then(setAvailableNodeTypes).catch(console.error);
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
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
        <NodePanel nodeTypes={availableNodeTypes} onDragStart={onDragStart} />
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
      </div>
    </ReactFlowProvider>
  );
};

export default WorkflowCanvas;
