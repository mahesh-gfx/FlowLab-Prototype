declare module "@saehrimnir/druidjs" {
  export class Matrix {
    static from(data: any[]): Matrix;
    to2dArray(): any[];
  }

  export class PCA {
    constructor(matrix: Matrix, nComponents: number);
    to2dArray(): any[];
  }

  export class TSNE {
    constructor(matrix: Matrix, nComponents: number);
    to2dArray(): any[];
  }

  export class UMAP {
    constructor(matrix: Matrix, nComponents: number);
    to2dArray(): any[];
  }
}
