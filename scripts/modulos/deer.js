import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';
import { escena } from './escena.js';

const animalesBase = [];

export function cargarAnimales() {
    const loaderAnimales = new GLTFLoader();
    loaderAnimales.load('./modelos/deer.glb', (gltf) => {
        animalesBase.push(gltf.scene);
    });
}

export function generarAnimalAleatorio(lado, separacion, z) {
    if (animalesBase.length > 0 && Math.random() < 0.3) {
        const base = animalesBase[Math.floor(Math.random() * animalesBase.length)];
        const animal = base.clone();

        animal.scale.set(1.5, 1.5, 1.5);

        animal.position.set(
            lado * (separacion + 2 + Math.random() * 3),
            0,
            z + (Math.random() * 8 - 4)
        );

        animal.rotation.y = Math.random() * Math.PI * 2;

        const box = new THREE.Box3().setFromObject(animal);
        animal.position.y = -box.min.y;

        animal.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });

        escena.add(animal);
    }
}
