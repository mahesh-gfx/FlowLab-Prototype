import * as workflowNodes from "@data-viz-tool/nodes";

export class NodeService {
  getNodeDefinitions(): Record<string, any> {
    return Object.entries(workflowNodes).reduce((acc, [key, NodeClass]) => {
      if (typeof NodeClass === "function" && key !== "BaseNode") {
        if (
          "getNodeDefinition" in NodeClass &&
          typeof NodeClass.getNodeDefinition === "function"
        ) {
          const definition = NodeClass.getNodeDefinition();
          acc[definition.name] = definition;
        } else {
          console.warn(
            `Node class ${key} does not have a static getNodeDefinition method`
          );
        }
      }
      return acc;
    }, {} as Record<string, any>);
  }
}

export const nodeService = new NodeService();
