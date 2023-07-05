export declare class WFCTool2D {
    tiles: Array<string[][]>;
    weights: number[];
    n_prototypes: number;
    formulae: Array<[number, '' | 'cw' | 'cw+cw' | 'cw+cw+cw', string[][]]>;
    transformBank: {
        cw: (m: string[][]) => string[][];
    };
    addTile(strTile: string, { transforms, weight, }?: {
        transforms?: ('cw' | 'cw+cw' | 'cw+cw+cw')[];
        weight?: number;
    }): number;
    getTileFormulae(): [number, "" | "cw" | "cw+cw" | "cw+cw+cw", string[][]][];
    generateWFCInput(): {
        weights: number[];
        rules: ["x" | "y", number, number][];
        nd: number;
    };
}
