import type { MutableRefObject } from 'react';
declare const KEY_CONTROL_MAP: {
    readonly ArrowLeft: "left";
    readonly ArrowRight: "right";
    readonly ArrowUp: "up";
    readonly ArrowDown: "down";
    readonly q: "left";
    readonly d: "right";
    readonly s: "down";
    readonly z: "up";
};
type KeyCode = keyof typeof KEY_CONTROL_MAP;
type GameControl = (typeof KEY_CONTROL_MAP)[KeyCode];
export declare function useControls(): MutableRefObject<Record<GameControl, boolean>>;
export {};
