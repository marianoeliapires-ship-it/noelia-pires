import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { escena } from './escena.js';
import { LIMITE_BOSQUE } from './constantes.js';

export function cargarTerrenal() {
    // 🟫 CAMINO DE TIERRA
    const caminoGeo = new THREE.PlaneGeometry(8, 200);
    const caminoMat = new THREE.MeshStandardMaterial({
        color: 0x8b5a2b, 
        roughness: 1
    });
    const camino = new THREE.Mesh(caminoGeo, caminoMat);
    camino.rotation.x = -Math.PI / 2;
    camino.position.set(0, 0.01, LIMITE_BOSQUE - 110);
    escena.add(camino);

    // 🏖️ TRANSICIÓN ARENA
    const arenaTransicion = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 150),
        new THREE.MeshStandardMaterial({ color: 0xf2d16b, roughness: 1 })
    );
    arenaTransicion.rotation.x = -Math.PI / 2;
    arenaTransicion.position.set(0, 0.02, camino.position.z - 120);
    arenaTransicion.receiveShadow = true;
    escena.add(arenaTransicion);

    // 🏖️ ARENA MÁS CLARA (zona húmeda)
    const arenaSuave = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 120),
        new THREE.MeshStandardMaterial({ color: 0xf7e4a0, roughness: 1 })
    );
    arenaSuave.rotation.x = -Math.PI / 2;
    arenaSuave.position.set(0, 0.03, LIMITE_BOSQUE - 200);
    escena.add(arenaSuave);
}
