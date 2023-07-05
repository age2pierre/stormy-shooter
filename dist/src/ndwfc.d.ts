import { FixedLengthArray, Join, ReadonlyTuple } from 'type-fest';
type StringCoord<N extends number> = Join<ReadonlyTuple<`${number}`, N>, ','>;
type Vec<N extends number> = FixedLengthArray<number, N>;
export type Rule = {
    ['1D']: ['x', number, number];
    ['2D']: ['x' | 'y', number, number];
    ['3D']: ['x' | 'y' | 'z', number, number];
};
export declare class WFC<N extends 1 | 2 | 3> {
    private wavefront;
    private readonly n_patterns;
    private nd;
    private weights;
    private rules;
    private wave;
    constructor(arg: {
        nd: N;
        weights: number[];
        rules: Rule[`${N}D`][];
        wave?: Record<StringCoord<N>, number>;
    });
    readout(collapse: true): Record<StringCoord<N>, number>;
    readout(collapse: false): Record<StringCoord<N>, number[]>;
    step(): boolean;
    expand(xmin: Vec<N>, xmax: Vec<N>): void;
    private propagate;
    private coord;
    private strCoord;
    private entropy;
    private collapse;
    private neighborable;
    private getIndexOfMaxValue;
}
export {};
