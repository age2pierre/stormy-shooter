import { Split } from 'type-fest';
import { ObjectEntry } from 'type-fest/source/entry';
export declare function split<S extends string, D extends string>(string: S, separator: D): Split<S, D>;
export declare function entries<T extends object>(obj: T): Array<ObjectEntry<T>>;
export declare function fromEntries<K extends string, T>(entries: Iterable<readonly [K, T]>): {
    [k in K]: T;
};
export declare function keys<T extends object>(o: T): Array<keyof T>;
export declare function range(arraySize: number): number[];
export declare function isNotNil<T>(value: T | null | undefined): value is T;
export declare function exhaustiveCheck(_param: never): void;
