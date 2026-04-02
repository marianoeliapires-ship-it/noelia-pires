import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

export const camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

export function actualizarCamara(coche) {
    if (!coche) return;

    const offset = new THREE.Vector3(
        Math.sin(coche.rotation.y) * 5.5,
        3.2,
        Math.cos(coche.rotation.y) * 5.5
    );

    camara.position.lerp(coche.position.clone().add(offset), 0.15);

    const target = coche.position.clone();
    target.y += 1.5;

    camara.lookAt(target);
}
