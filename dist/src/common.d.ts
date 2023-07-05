export type CollisionGene = number & {
    __brand: CollisionGene;
};
export declare const SCENERY_GROUP: CollisionGene;
export declare const PLAYER_GROUP: CollisionGene;
export declare const ENEMY_GROUP: CollisionGene;
export declare const PROJECTILE_GROUP: CollisionGene;
export declare function computeCollissionGroup(menberships: CollisionGene | CollisionGene[], filterships?: CollisionGene[]): number;
export type Duplet = [number, number];
export declare const MOUSE_POSITION: {
    x: number;
    y: number;
};
