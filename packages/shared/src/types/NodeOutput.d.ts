/// <reference types="node" />
export interface NodeOutput {
    data: {
        json: any[];
        binary: Buffer[];
    };
    parameters: Record<string, any>;
}
