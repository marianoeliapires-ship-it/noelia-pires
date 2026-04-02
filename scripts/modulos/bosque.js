import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';
import { escena } from './escena.js';
import { generarAnimalAleatorio } from './deer.js';

let bosqueBase;

export function cargarBosque() {
    const loaderBosque = new GLTFLoader();
    loaderBosque.load('./modelos/bosque.glb', (gltf) => {
        bosqueBase = gltf.scene;

        const box = new THREE.Box3().setFromObject(bosqueBase);
        const centro = box.getCenter(new THREE.Vector3());
        bosqueBase.position.sub(centro);

        bosqueBase.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });
    });
}

export function crearBosqueLateral(z, anchoCarretera) {
    if (!bosqueBase) return;

    const margen = 60;
    const separacion = anchoCarretera + margen;

    for (let i = 0; i < 2; i++) {
        const lado = i === 0 ? 1 : -1;

        const bosque = bosqueBase.clone();
        bosque.scale.set(4, 4, 4);
        bosque.position.set(lado * separacion, 0, z);

        escena.add(bosque);

        // Animales integrados en el bosque
        generarAnimalAleatorio(lado, separacion, z);
    }
}
