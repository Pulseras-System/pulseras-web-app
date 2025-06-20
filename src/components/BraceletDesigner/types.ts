import * as THREE from 'three';

export interface BraceletPart {
    id: string;
    name: string;
    modelPath: string;
    category: string;
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
    scale?: THREE.Vector3;
}

export interface RenderedObject {
    id: string;
    object: THREE.Object3D;
    partData: BraceletPart;
}
