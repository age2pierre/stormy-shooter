import { Collider } from '@dimforge/rapier2d-compat';
import { ReactNode } from 'react';
import { Duplet } from './common';
export declare function Projectile({ position, direction, radius, speed, children, ttl, onTimeout, onCollide, }: {
    ttl?: number;
    position: Duplet;
    direction: Duplet;
    speed?: number;
    radius?: number;
    children: ReactNode;
    onTimeout?: () => void;
    onCollide?: (ev: {
        position: Duplet;
        target: Collider;
    }) => void;
}): import("react/jsx-runtime").JSX.Element;
