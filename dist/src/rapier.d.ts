/// <reference types="react" />
import type Rapier from '@dimforge/rapier2d-compat';
import { Collider, KinematicCharacterController, World } from '@dimforge/rapier2d-compat';
interface RapierContext {
    rapier: typeof Rapier;
    world: World;
    characterController: KinematicCharacterController;
    registerCollisionEvent: (collider: Collider, onStart?: (target: Collider) => void, onEnd?: (target: Collider) => void) => void;
    cleanupCollisionEvent: (collider: Collider) => void;
}
export declare const RapierContext: import("react").Context<RapierContext | undefined>;
export declare function importRapier(): Promise<typeof import("@dimforge/rapier2d-compat")>;
export declare function useRapier(): RapierContext;
export {};
