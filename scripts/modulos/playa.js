import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';
import { escena } from './escena.js';

export function cargarPlaya() {
    const loaderPlaya = new GLTFLoader();

    loaderPlaya.load('./modelos/playa.glb', (gltf) => {
        const playa = gltf.scene;
        playa.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });
        playa.scale.set(100, 100, 100);
        playa.position.set(0, 0, 180);
        escena.add(playa);
    });
}
