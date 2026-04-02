import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';
import { escena } from './escena.js';
import { LIMITE_CARRETERA } from './constantes.js';

export function cargarCampo() {
    const loaderCampo = new GLTFLoader();

    loaderCampo.load('./modelos/campo.glb', (gltf) => {
        const base = gltf.scene;
        base.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = false;
                obj.receiveShadow = false;
            }
        });

        const columnas = 20; 
        const filas = 2;     
        const tamaño = 25;   

        for (let z = 0; z < filas; z++) {
            for (let x = -columnas/2; x < columnas/2; x++) {
                const campo = base.clone();
                campo.scale.set(14, 14, 14); 
                campo.position.set(x * tamaño, 0, LIMITE_CARRETERA - 70 - (z * tamaño));
                escena.add(campo);
            }
        }
    });
}
