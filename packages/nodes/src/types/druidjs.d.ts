declare module "@data-viz-tool/druidjs" {
  export class Matrix {
    constructor(
      rows: number,
      cols: number,
      value?: number | string | ((row: number, col: number) => number)
    );
    static from(
      A: Matrix | number[][] | Float64Array | number,
      type?: "row" | "col" | "diag"
    ): Matrix;
    row(row: number): Float64Array;
    *iterate_rows(): Generator<Float64Array>;
    *[Symbol.iterator](): Generator<Float64Array>;
    set_row(row: number, values: number[] | Matrix): Matrix;
    swap_rows(row1: number, row2: number): Matrix;
    col(col: number): Float64Array;
    entry(row: number, col: number): number;
    set_entry(row: number, col: number, value: number): Matrix;
    add_entry(row: number, col: number, value: number): Matrix;
    sub_entry(row: number, col: number, value: number): Matrix;
    transpose(): Matrix;
    get T(): Matrix;
    inverse(): Matrix;
    dot(B: Matrix | number[]): Matrix | number[];
    transDot(B: Matrix | number[]): Matrix | number[];
    dotTrans(B: Matrix | number[]): Matrix | number[];
    outer(B: Matrix): Matrix;
    concat(B: Matrix, type?: "horizontal" | "vertical" | "diag"): Matrix;
    set_block(offset_row: number, offset_col: number, B: Matrix): Matrix;
    get_block(
      start_row: number,
      start_col: number,
      end_row?: number,
      end_col?: number
    ): Matrix;
    gather(row_indices: number[], col_indices: number[]): Matrix;
    clone(): Matrix;
    mult(
      value: Matrix | number[] | number,
      options?: { inline?: boolean }
    ): Matrix;
    divide(
      value: Matrix | number[] | number,
      options?: { inline?: boolean }
    ): Matrix;
    add(
      value: Matrix | number[] | number,
      options?: { inline?: boolean }
    ): Matrix;
    sub(
      value: Matrix | number[] | number,
      options?: { inline?: boolean }
    ): Matrix;
    get shape(): [number, number];
    set shape(value: [number, number, (row: number, col: number) => number]);
    get to2dArray(): Float64Array[];
    get asArray(): number[][];
    get diag(): Float64Array;
    get mean(): number;
    get sum(): number;
    get values(): Float64Array;
    get meanRows(): Float64Array;
    get meanCols(): Float64Array;
    static solve_CG(
      A: Matrix,
      b: Matrix,
      randomizer?: any,
      tol?: number
    ): Matrix;
    static solve(A: Matrix, b: Matrix): Matrix;
    static LU(A: Matrix): { L: Matrix; U: Matrix };
    static det(A: Matrix): number;
    static SVD(M: Matrix, k?: number): { U: Matrix; Sigma: Matrix; V: Matrix };
    static isArray(A: any): boolean;
  }

  export class DR {
    constructor(
      X: Matrix | number[][],
      default_parameters: object,
      parameters: object
    );
  }

  export class PCA extends DR {
    constructor(
      X: Matrix | number[][],
      parameters: { d?: number; seed?: number; eig_args?: object }
    );
    transform(A?: Matrix | number[][] | null): Matrix | number[][];
    principal_components(): Matrix;
    static principal_components(
      X: Matrix,
      parameters: { d?: number; seed?: number; eig_args?: object }
    ): Matrix;
  }

  export class TSNE extends DR {
    constructor(
      X: Matrix,
      parameters: {
        perplexity?: number;
        epsilon?: number;
        d?: number;
        metric?: Function | "precomputed";
        seed?: number;
      }
    );
    init(): TSNE;
    transform(iterations?: number): Matrix | number[][];
    generator(iterations?: number): Generator<Matrix | number[][]>;
  }

  export class UMAP extends DR {
    constructor(
      X: Matrix,
      parameters: {
        n_neighbors?: number;
        local_connectivity?: number;
        min_dist?: number;
        d?: number;
        metric?: Function;
        seed?: number;
        _spread?: number;
        _set_op_mix_ratio?: number;
        _repulsion_strength?: number;
        _negative_sample_rate?: number;
        _n_epochs?: number;
        _initial_alpha?: number;
      }
    );
    init(): UMAP;
    transform(iterations?: number): Matrix | number[][];
    generator(iterations?: number): Generator<Matrix | number[][]>;
  }
}
