import { Duplet } from './common';
export type BulletId = string & {
    __brand: BulletId;
};
export type BulletInitState = {
    direction: Duplet;
    position: Duplet;
};
export declare function useBulletStore(): {
    readonly [x: string & {
            __brand: BulletId;
        }]: {
        readonly direction: readonly [number, number];
        readonly position: readonly [number, number];
    } | null;
};
export declare function addBullet(args: BulletInitState): BulletId;
export declare function deleteBullet(id: BulletId): void;
