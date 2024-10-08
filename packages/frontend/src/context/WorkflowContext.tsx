import React, {
  useState,
  useCallback,
  useRef,
  createContext,
  useMemo,
  useEffect,
} from "react";

import {
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  NodeProps,
  ReactFlowInstance,
  Edge,
  getConnectedEdges,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  WorkflowStructure,
  NodeData,
  WorkflowNode,
  WorkflowEdge,
  NodeProperty,
} from "@data-viz-tool/shared";
import { saveAs } from "file-saver";
import { executeWorkflow } from "../api/executeWorkflow";

//Import nodes
import DefaultNode from "../components/nodes/DefaultNode";
import { StartNode } from "@data-viz-tool/nodes";
import D3Node from "../components/nodes/D3Node";
import ButtonEdge from "../components/edges/ButtonEdge";
import ScatterPlotMatrixNode from "../components/nodes/ScatterPlotMatrixNode";
import ParallelCoordinates from "../components/nodes/ParallelCoordinatesNode";
import CorrelationHeatmap from "../components/nodes/CorrelationHeatmapNode";

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

const initialStartNode: Node<NodeData> = {
  id: "start-node",
  type: "StartNode",
  position: { x: 100, y: 100 },
  data: {
    label: "Start",
    type: "StartNode",
    properties: StartNode.getNodeDefinition().properties.reduce((acc, prop) => {
      acc[prop.name] = prop.default;
      return acc;
    }, {} as Record<string, any>),
  },
};

const connectionLineStyle = { stroke: "#fffff" };

const WorkflowContext = createContext<any>(null);

function replacePathSegment(
  path: string,
  targetSegment: string,
  replacement: string
): string {
  const parts = path.split("/");
  const newPath = parts
    .map((part) => (part === targetSegment ? replacement : part))
    .join("/");
  return newPath;
}

function updateUrlPath(newPath: string): void {
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  url.pathname = newPath;
  history.replaceState({}, "", url.toString());
}

const WorkflowProvider = ({ children }: any) => {
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
  const [workflowId, setWorkflowId] = useState<string>("");
  const [NodeConfigModalIsOpen, setNodeConfigModalIsOpen] = useState(false);
  const callbackRef = useRef<(() => void) | null>(null);
  const prevWorkflowIdRef = useRef<string | null>(null);
  const [clickTimeout, setClickTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const CLICK_DELAY = 150; // Fixed timeout duration in milliseconds for single click on node

  useEffect(() => {
    // Extract the workflow ID from the URL
    const path = window.location.pathname;
    const parts = path.split("/");
    const id = parts[parts.length - 1]; // Get the last part of the path

    if (path.startsWith("/workflow/")) {
      console.log("ID: ", id);
      setTimeout(() => {
        setWorkflowId(`${id}`);
      }, 200);
    }

    console.log("Updated workflow id: ", workflowId);
  }, [window.location.pathname]);

  useEffect(() => {
    console.log("NEW USE EFFECT");
    // Execute the callback function only if previous workflowId was 'new'
    if (callbackRef.current && prevWorkflowIdRef.current === "new") {
      callbackRef.current();
      callbackRef.current = null; // Reset the callback after execution
    }
  }, [workflowId]);

  const openModal = () => {
    setNodeConfigModalIsOpen(true);
  };

  const closeModal = () => {
    setNodeConfigModalIsOpen(false);
  };

  const nodeTypes = useMemo(() => {
    return Object.entries(nodeDefinitions).reduce((acc, [key, def]) => {
      acc[key] = React.memo((props: NodeProps<NodeData>) => {
        const { id, data, type } = props;
        // console.log("NODE TYPES: ", type);
        switch (type) {
          case "D3JsNode":
            return <D3Node id={id} data={data} def={def} type={type} />;
          case "ScatterPlotMatrixNode":
            return (
              <ScatterPlotMatrixNode
                id={id}
                data={data}
                def={def}
                type={type}
              />
            );
          case "ParallelCoordinatesNode":
            return (
              <ParallelCoordinates id={id} data={data} def={def} type={type} />
            );

          case "CorrelationHeatmapNode":
            return (
              <CorrelationHeatmap id={id} data={data} def={def} type={type} />
            );

          default:
            return <DefaultNode id={id} data={data} def={def} type={type} />;
        }
      });
      return acc;
    }, {} as Record<string, React.ComponentType<NodeProps<NodeData>>>);
  }, [nodeDefinitions]);

  const edgeTypes = {
    buttonedge: ButtonEdge,
  };

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#fffff" },
            type: "buttonedge",
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    console.log("Dragover...");
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

  const handleNodeClick = useCallback(
    (_: any, node: Node<NodeData>) => {
      // Clear any existing timeout
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        setClickTimeout(null);
      }
      const timeout = setTimeout(() => {
        reactFlowInstance?.fitView({ nodes: [node], duration: 150 }); // Adjust duration as needed
      }, CLICK_DELAY);

      setClickTimeout(timeout);
    },
    [reactFlowInstance?.fitView, clickTimeout]
  );

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node<NodeData>) => {
      // Clear the single click timeout
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        setClickTimeout(null);
      }
      setSelectedNode(node);
      setTimeout(() => {
        setNodeConfigModalIsOpen(true);
      }, 100);
    },
    [clickTimeout]
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

    // Update the node data with the execution result and remove the error property
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === data.nodeId) {
          const { error, ...restData } = node.data; // Destructure to remove 'error'
          return {
            ...node,
            data: { ...restData, output: data.output }, // Use the rest of the data without 'error'
          };
        }
        return node;
      })
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
        setExecutionErrors([]);
        setIsExecuting(true);
        setExecutionStatus("Executing workflow...");
        console.log("Executionresults: ", executionResults);
        executeWorkflow(
          workflowId,
          workflowData,
          handleNodeExecuted,
          handleNodeError,
          handleWorkflowCompleted
        ).then((response: any) => {
          const path = window.location.pathname;
          const parts = path.split("/");
          const id = parts[parts.length - 1]; // Get the last part of the path

          if (id === "new" && typeof response.data.workflowId === "string") {
            // Set the callback function to be executed after state update if previous value was 'new'
            callbackRef.current = () => {
              console.log("Workflow ID updated to:", response.data.workflowId);
              updateUrlPath(
                replacePathSegment(path, "new", response.data.workflowId)
              );
            };

            // Store the current workflowId to prevWorkflowIdRef before updating
            prevWorkflowIdRef.current = workflowId;
            setWorkflowId(response.data.workflowId);
          }
        });
      } catch (error: any) {
        console.error("Workflow execution failed:", error);
        setExecutionErrors([{ nodeId: "global", error: error.message }]);
        setIsExecuting(false);
        setExecutionStatus("Workflow execution failed.");
      }
    }
  }, [reactFlowInstance, setNodes, workflowId]);

  const onNodesDelete = (deletedNodes: any) => {
    // Find all edges connected to the deleted nodes
    const connectedEdges = getConnectedEdges(deletedNodes, edges);

    // Update the edges by filtering out the connected ones
    setEdges((eds) => eds.filter((edge) => !connectedEdges.includes(edge)));
  };

  const deleteNodeById = (nodeId: string) => {
    // Find the node to be deleted
    const nodeToDelete = nodes.find((node) => node.id === nodeId);

    if (!nodeToDelete) {
      console.warn(`Node with ID ${nodeId} not found.`);
      return;
    }

    // Filter out the node to be deleted
    const remainingNodes = nodes.filter((node) => node.id !== nodeId);

    // Find and remove edges connected to the node to be deleted
    const connectedEdges = getConnectedEdges([nodeToDelete], edges);
    const remainingEdges = edges.filter(
      (edge) => !connectedEdges.includes(edge)
    );

    // Update the state with the remaining nodes and edges
    setNodes(remainingNodes);
    setEdges(remainingEdges);
  };

  const transformEdges = (edges: any) => {
    return edges.map((edge: any) => {
      edge["animated"] = true;
      edge["style"] = {
        stroke: "#fffff",
      };
      edge["type"] = "buttonedge";
      return edge;
    });
  };

  const onNodeDragStop = (event: Event, node: any) => {
    console.log("On node drag stop: ", event, node);
    // const updatedEdges = edges.map((edge: any) => {
    //   return {
    //     ...edge,
    //   };
    // });
    // setEdges(updatedEdges); // Trigger re-render of edges with updated handles
  };

  return (
    <WorkflowContext.Provider
      value={{
        nodes,
        initialStartNode,
        setNodes,
        onNodesChange,
        edges,
        setEdges,
        onEdgesChange,
        selectedNode,
        setSelectedNode,
        nodeDefinitions,
        setNodeDefinitions,
        executionResults,
        setExecutionResults,
        executionErrors,
        setExecutionErrors,
        reactFlowWrapper,
        reactFlowInstance,
        setReactFlowInstance,
        isExecuting,
        setIsExecuting,
        executionStatus,
        setExecutionStatus,
        workflowId,
        setWorkflowId,
        nodeTypes,
        edgeTypes,
        onConnect,
        onDragOver,
        connectionLineStyle,
        onDrop,
        onNodeDoubleClick,
        onDragStart,
        onExport,
        onImport,
        getConnectedNodes,
        handleNodeExecuted,
        handleNodeError,
        handleWorkflowCompleted,
        startWorkflowExecutionV2,
        onNodesDelete,
        deleteNodeById,
        transformEdges,
        NodeConfigModalIsOpen,
        openModal,
        closeModal,
        onNodeDragStop,
        handleNodeClick,
        clickTimeout,
        setClickTimeout,
        CLICK_DELAY,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export { WorkflowContext, WorkflowProvider };
